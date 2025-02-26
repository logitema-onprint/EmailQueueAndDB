import { Job, Tag } from "@prisma/client";
import { queuesQueries } from "../queries/queuesQueries";
import { EmailQueue } from "../queues/emailQueue";
import { PausedQueue } from "../queues/pausedQueue";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { JobItem } from "../queries/queuesQueries/createQuery";
import { tagQueries } from "../queries/tagQueries";
import { log } from "console";

interface Tags {
  id: number;
  tagName: string;
  scheduledFor: bigint;
}

type TagStatus = "PAUSED" | "QUEUED" | "INACTIVE";

const bigIntToNumber = (value: bigint): number => {
  const num = Number(value);
  if (num > Number.MAX_SAFE_INTEGER) {
    throw new Error("BigInt value is too large to be converted to number");
  }
  return num;
};

export class QueueService {
  static async createQueues(orderIds: number | number[], tags: Tags[]) {
    try {
      if (!tags || tags.length === 0) {
        throw new Error("Missing required tags");
      }

      const orderIdArray = Array.isArray(orderIds) ? orderIds : [orderIds];
      const timestamp = new Date().toISOString();
      let bulkJobs = [];
      let queueItems = [];
      const tagCountMap = new Map<number, number>();

      for (const orderId of orderIdArray) {
        for (const tag of tags) {
          const jobId = uuidv4();
          const delay = bigIntToNumber(tag.scheduledFor);
          bulkJobs.push({
            name: "email-job",
            data: {
              jobId: jobId,
              tagName: tag.tagName,
              tagId: tag.id,
            },
            opts: {
              jobId: jobId,
              delay: delay,
              attempts: 3,
            },
          });
          queueItems.push({
            id: jobId,
            orderId,
            tagId: tag.id,
            tagName: tag.tagName,
            status: "QUEUED",
            updatedAt: timestamp,
            scheduledFor: tag.scheduledFor,
            processedAt: null,
            error: null,
          });
          tagCountMap.set(tag.id, (tagCountMap.get(tag.id) || 0) + 1);
        }
      }

      const jobs = await EmailQueue.addBulk(bulkJobs);

      const queueResult = await queuesQueries.createQueueBulk(queueItems);

      if (!queueResult.success) {
        for (const job of jobs) {
          await job.remove();
        }
        throw new Error(`Failed to create queue records: ${queueResult.error}`);
      }

      const tagUpdates = Array.from(tagCountMap.entries()).map(
        ([id, count]) => ({ id, count })
      );
      const tagUpdateResult = await tagQueries.updateTagCountMany(
        tagUpdates,
        "increment"
      );

      if (!tagUpdateResult.success) {
        logger.error(`Failed to update tag counts: ${tagUpdateResult.error}`);
      }

      const createdJobs = jobs.map((job, index) => ({
        queueId: bulkJobs[index].opts.jobId,
        jobId: job.id,
        tag: bulkJobs[index].data.tagName,
        orderId: queueItems[index].orderId,
      }));

      return {
        success: true,
        message: `Successfully created ${createdJobs.length} queue jobs`,
        data: createdJobs,
        totalJobsCreated: createdJobs.length,
        successCount: orderIdArray.length,
      };
    } catch (error) {
      logger.error("Failed to create queues", error);
      return {
        success: false,
        message: "Failed to create queues",
        error: error instanceof Error ? error.message : "Unknown error",
        totalJobsCreated: 0,
        successCount: 0,
      };
    }
  }

  static async getTimeLeft(jobId: string) {
    const job = await EmailQueue.getJob(jobId);

    if (!job) {
      logger.error(`Job services getTimeLeft ${jobId} not found`);
      return null;
    }

    // Get all timing information
    const now = Date.now();
    const originalDelay = job.opts.delay ?? 0;
    const jobTimestamp = job.timestamp;
    const processAt = jobTimestamp + originalDelay;
    const timeLeft = processAt - now;

    // Calculate time units
    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    // logger.info("Raw job timing values:", {
    //   delay: job?.opts.delay,
    //   timestamp: job?.timestamp,
    //   currentTimestamp: Date.now(),
    // });

    // logger.info("Job Timing Analysis:", {
    //   jobId,
    //   jobName: job.name,
    //   tagName: job.data.tagName,
    //   timing: {
    //     currentTime: new Date(now).toISOString(),
    //     jobCreatedAt: new Date(jobTimestamp).toISOString(),
    //     willProcessAt: new Date(processAt).toISOString(),
    //     originalDelay,
    //     timeLeft,
    //     breakdown: {
    //       days,
    //       remainingHours,
    //       remainingMinutes,
    //       remainingSeconds,
    //     },
    //     humanReadable: `${days} days, ${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds`,
    //   },
    // });

    return timeLeft > 0 ? timeLeft : 0;
  }
  static async getJobFromQueues(jobId: string) {
    let job = await EmailQueue.getJob(jobId);

    if (!job) {
      job = await PausedQueue.getJob(jobId);
    }

    const item = await queuesQueries.getQuery(jobId);

    if (!job && !item.item) {
      logger.warn(`Job ${jobId} not found in any queue or DB`);
      return {
        message: `Job not found in Db`,
      };
    }

    return {
      job,
      data: item?.item,
    };
  }
  static async removeJobsFromQueues(jobIds: string[]) {
    if (!jobIds || !jobIds.length) {
      throw new Error("No job IDs provided");
    }

    const totalJobsFound = jobIds.length;

    if (jobIds.length === 0) {
      logger.info("No jobs provided");
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsRemoved: 0,
        message: "No jobs provided",
      };
    }

    const emailJobs: any[] = [];
    const pausedJobs: any[] = [];
    const tagCountMap = new Map<number, number>();
    let totalJobsProcessed = 0;
    let totalJobsRemoved = 0;

    const jobPromises = jobIds.map(async (jobId) => {
      try {
        totalJobsProcessed++;

        const emailJob = await EmailQueue.getJob(jobId);
        if (emailJob) {
          emailJobs.push(emailJob);

          const jobState = await emailJob.getState();
          const tagId = emailJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: jobId, success: true, queue: "email" };
        }

        const pausedJob = await PausedQueue.getJob(jobId);
        if (pausedJob) {
          pausedJobs.push(pausedJob);

          const jobState = await pausedJob.getState();
          const tagId = pausedJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: jobId, success: true, queue: "paused" };
        }

        return { jobId: jobId, success: true, queue: "none" };
      } catch (error) {
        logger.error(`Failed to process job ${jobId}:`, error);
        return {
          jobId: jobId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(jobPromises);

    if (emailJobs.length > 0) {
      try {
        await Promise.all(emailJobs.map((job) => job.remove()));
        totalJobsRemoved += emailJobs.length;
      } catch (error) {
        logger.error("Failed to remove some email queue jobs:", error);
      }
    }

    if (pausedJobs.length > 0) {
      try {
        await Promise.all(pausedJobs.map((job) => job.remove()));
        totalJobsRemoved += pausedJobs.length;
      } catch (error) {
        logger.error("Failed to remove some paused queue jobs:", error);
      }
    }

    if (tagCountMap.size > 0) {
      const tagUpdates = Array.from(tagCountMap.entries()).map(
        ([id, count]) => ({ id, count })
      );
      await tagQueries.updateTagCountMany(tagUpdates, "decrement");
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsRemoved,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully removed ${totalJobsRemoved} jobs, ${failureCount} failed`,
    };
  }
  static async pauseOrders(orderIds: number[], tagIds?: number[]) {
    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    const queryParams = {
      status: "QUEUED",
      orderIds: orderIds,
      tagIds: tagIds,
      includeTotalCount: true,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;

    if (jobs.length === 0) {
      logger.info("No queued jobs found for the provided orders");
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsPaused: 0,
        message: "No queued jobs found for the provided orders",
      };
    }

    const emailJobs: any[] = [];
    let totalJobsProcessed = 0;
    let totalJobsPaused = 0;

    const jobPromises = jobs.map(async (queueItem: Job) => {
      try {
        totalJobsProcessed++;

        const emailJob = await EmailQueue.getJob(queueItem.id);
        if (emailJob) {
          const jobState = await emailJob.getState();

          if (jobState === "delayed") {
            emailJobs.push({
              job: emailJob,
              timeLeft: await QueueService.getTimeLeft(queueItem.id),
            });
            return { jobId: queueItem.id, success: true, queue: "email" };
          } else {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job is not in delayed state",
            };
          }
        }

        return {
          jobId: queueItem.id,
          success: false,
          error: "Job not found in EmailQueue",
        };
      } catch (error) {
        logger.error(`Failed to process job ${queueItem.id}:`, error);
        return {
          jobId: queueItem.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(jobPromises);

    if (emailJobs.length > 0) {
      try {
        await Promise.all(
          emailJobs.map(async ({ job, timeLeft }) => {
            await PausedQueue.add(
              "paused-job",
              { ...job.data, timeLeft },
              { jobId: job.id }
            );

            await job.remove();
          })
        );

        const jobIds = emailJobs.map((item) => item.job.data.jobId);
        await queuesQueries.updateManyStatusQuery(jobIds, { status: "PAUSED" });

        totalJobsPaused += emailJobs.length;
      } catch (error) {
        logger.error("Failed to pause some email queue jobs:", error);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsPaused,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully paused ${totalJobsPaused} jobs, ${failureCount} failed`,
    };
  }

  static async resumeOrders(orderIds: number[], tagIds?: number[]) {
    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    const queryParams = {
      status: "PAUSED",
      tagIds: tagIds,
      orderIds: orderIds,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;

    if (jobs.length === 0) {
      logger.info("No paused jobs found for the provided orders");
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsResumed: 0,
        message: "No paused jobs found for the provided orders",
      };
    }

    const pausedJobs: any[] = [];
    let totalJobsProcessed = 0;
    let totalJobsResumed = 0;

    const jobPromises = jobs.map(async (queueItem: Job) => {
      try {
        totalJobsProcessed++;

        const pausedJob = await PausedQueue.getJob(queueItem.id);
        if (pausedJob) {
          pausedJobs.push(pausedJob);
          return { jobId: queueItem.id, success: true, queue: "paused" };
        }

        return {
          jobId: queueItem.id,
          success: false,
          error: "Job not found in PausedQueue",
        };
      } catch (error) {
        logger.error(`Failed to process job ${queueItem.id}:`, error);
        return {
          jobId: queueItem.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(jobPromises);

    if (pausedJobs.length > 0) {
      try {
        await Promise.all(
          pausedJobs.map(async (job) => {
            await EmailQueue.add(
              "email-job",
              { ...job.data },
              {
                jobId: job.id,
                delay: job.data.timeLeft,
                attempts: 3,
              }
            );

            await job.remove();
          })
        );

        const jobIds = pausedJobs.map((job) => job.id);
        await queuesQueries.updateManyStatusQuery(jobIds, { status: "QUEUED" });

        totalJobsResumed += pausedJobs.length;
      } catch (error) {
        logger.error("Failed to resume some paused queue jobs:", error);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsResumed,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully resumed ${totalJobsResumed} jobs, ${failureCount} failed`,
    };
  }
  static async makeInactiveOrders(orderIds: number[], tagIds?: number[]) {
    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    const queryParams = {
      status: ["PAUSED", "QUEUED"],
      orderIds: orderIds,
      tagIds,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;

    if (jobs.length === 0) {
      logger.info("No paused or active jobs found for the provided orders");
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsRemoved: 0,
        message: "No paused or active jobs found for the provided orders",
      };
    }

    const emailJobs: any[] = [];
    const pausedJobs: any[] = [];
    const tagCountMap = new Map<number, number>();
    let totalJobsProcessed = 0;
    let totalJobsRemoved = 0;

    const jobPromises = jobs.map(async (queueItem: Job) => {
      try {
        totalJobsProcessed++;

        const emailJob = await EmailQueue.getJob(queueItem.id);
        if (emailJob) {
          emailJobs.push(emailJob);

          const jobState = await emailJob.getState();
          const tagId = emailJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: queueItem.id, success: true, queue: "email" };
        }

        const pausedJob = await PausedQueue.getJob(queueItem.id);
        if (pausedJob) {
          pausedJobs.push(pausedJob);

          const jobState = await pausedJob.getState();
          const tagId = pausedJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: queueItem.id, success: true, queue: "paused" };
        }

        return { jobId: queueItem.id, success: true, queue: "none" };
      } catch (error) {
        logger.error(`Failed to process job ${queueItem.id}:`, error);
        return {
          jobId: queueItem.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(jobPromises);

    if (emailJobs.length > 0) {
      try {
        await Promise.all(emailJobs.map((job) => job.remove()));
        totalJobsRemoved += emailJobs.length;
      } catch (error) {
        logger.error("Failed to remove some email queue jobs:", error);
      }
    }

    if (pausedJobs.length > 0) {
      try {
        await Promise.all(pausedJobs.map((job) => job.remove()));
        totalJobsRemoved += pausedJobs.length;
      } catch (error) {
        logger.error("Failed to remove some paused queue jobs:", error);
      }
    }

    if (tagCountMap.size > 0) {
      const tagUpdates = Array.from(tagCountMap.entries()).map(
        ([id, count]) => ({ id, count })
      );
      await tagQueries.updateTagCountMany(tagUpdates, "decrement");
    }

    const jobIds = jobs.map((job) => job.id);
    await queuesQueries.updateManyStatusQuery(jobIds, { status: "INACTIVE" });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsRemoved,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully removed ${totalJobsRemoved} jobs, ${failureCount} failed`,
    };
  }
  static async removeTagsFromOrders(orderIds: number[], tagIds?: number[]) {
    if (!orderIds || !orderIds.length) {
      throw new Error("No order IDs and tags provided");
    }

    const queryParams = {
      orderIds,
      tagIds,
      includeTotalCount: true,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;

    if (jobs.length === 0) {
      logger.info("No jobs found for the provided orders and tags");
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsRemoved: 0,
        message: "No jobs found for the provided orders and tags",
      };
    }

    const emailJobs: any[] = [];
    const pausedJobs: any[] = [];
    const tagCountMap = new Map<number, number>();
    let totalJobsProcessed = 0;
    let totalJobsRemoved = 0;

    const jobPromises = jobs.map(async (queueItem: Job) => {
      try {
        totalJobsProcessed++;

        const emailJob = await EmailQueue.getJob(queueItem.id);
        if (emailJob) {
          emailJobs.push(emailJob);

          const jobState = await emailJob.getState();
          const tagId = emailJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: queueItem.id, success: true, queue: "email" };
        }

        const pausedJob = await PausedQueue.getJob(queueItem.id);
        if (pausedJob) {
          pausedJobs.push(pausedJob);

          const jobState = await pausedJob.getState();
          const tagId = pausedJob.data.tagId;
          if (jobState !== "completed" && jobState !== "failed") {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
          }

          return { jobId: queueItem.id, success: true, queue: "paused" };
        }

        return { jobId: queueItem.id, success: true, queue: "none" };
      } catch (error) {
        logger.error(`Failed to process job ${queueItem.id}:`, error);
        return {
          jobId: queueItem.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(jobPromises);

    if (emailJobs.length > 0) {
      try {
        await Promise.all(emailJobs.map((job) => job.remove()));
        totalJobsRemoved += emailJobs.length;
      } catch (error) {
        logger.error("Failed to remove some email queue jobs:", error);
      }
    }

    if (pausedJobs.length > 0) {
      try {
        await Promise.all(pausedJobs.map((job) => job.remove()));
        totalJobsRemoved += pausedJobs.length;
      } catch (error) {
        logger.error("Failed to remove some paused queue jobs:", error);
      }
    }

    if (tagCountMap.size > 0) {
      logger.warn(tagCountMap.size, tagCountMap);
      const tagUpdates = Array.from(tagCountMap.entries()).map(
        ([id, count]) => ({ id, count })
      );
      await tagQueries.updateTagCountMany(tagUpdates, "decrement");
    }

    await queuesQueries.deleteManyJobs({
      orderIds,
      tagIds,
    });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsRemoved,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully removed ${totalJobsRemoved} jobs, ${failureCount} failed`,
    };
  }
}
