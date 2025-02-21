import { Job, Tag } from "@prisma/client";
import { queuesQueries } from "../queries/queuesQueries";
import { EmailJob, EmailQueue } from "../queues/emailQueue";
import { PausedQueue } from "../queues/pausedQueue";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { JobItem } from "../queries/queuesQueries/createQuery";
import { tagQueries } from "../queries/tagQueries";

interface Tags {
  id: number;
  tagName: string;
  scheduledFor: bigint;
}

const bigIntToNumber = (value: bigint): number => {
  const num = Number(value);
  if (num > Number.MAX_SAFE_INTEGER) {
    throw new Error("BigInt value is too large to be converted to number");
  }
  return num;
};

export class QueueService {
  static async createQueues(orderId: number | undefined, tags: Tags[]) {
    try {
      if (!tags || tags.length === 0) {
        throw new Error("Missing required tags");
      }

      const timestamp = new Date().toISOString();
      const createdJobs = [];

      for (const tag of tags) {
        const jobId = uuidv4();

        const delay = bigIntToNumber(tag.scheduledFor);

        const job = await EmailQueue.add(
          "email-job",
          {
            jobId: jobId,
            tagName: tag.tagName,
            tagId: tag.id,
          },
          {
            jobId: jobId,
            delay: delay, // Now using the converted number
            attempts: 3,
          }
        );

        const queueItem: JobItem = {
          id: jobId,
          orderId,
          tagId: tag.id,
          tagName: tag.tagName,
          status: "QUEUED",
          updatedAt: timestamp,
          scheduledFor: tag.scheduledFor, // Keep as BigInt for DB
          processedAt: undefined,
          error: null,
        };

        const result = await queuesQueries.createQueue(queueItem);
        await tagQueries.updateTagCount(tag.id, "increment");

        if (result.error) {
          await job.remove();
          throw new Error(
            `Failed to create queue for tag ${tag.tagName}: ${result.error}`
          );
        }

        createdJobs.push({
          queueId: jobId,
          jobId: job.id,
          tag: tag.tagName,
        });
      }

      return {
        success: true,
        message: `Successfully created ${createdJobs.length} queue jobs`,
        data: createdJobs,
      };
    } catch (error) {
      logger.error("Failed to create queues", error);
      return {
        success: false,
        message: "Failed to create queues",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getTimeLeft(jobId: string) {
    const job = await EmailQueue.getJob(jobId);
    if (!job) {
      logger.error(`Job services getTimeLeft ${jobId} not found`);
      return null;
    }
    const now = Date.now();
    const processAt = job.timestamp + (job.opts.delay ?? 0);
    const timeLeft = processAt - now;

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
    try {
      const removalPromises = jobIds.map(async (jobId) => {
        const emailQueueJob = await EmailQueue.getJob(jobId);
        if (emailQueueJob) {
          await emailQueueJob.remove();
          await tagQueries.updateTagCount(
            emailQueueJob.data.tagId,
            "decrement"
          );
          return { jobId, queue: "email" };
        }

        const pausedQueueJob = await PausedQueue.getJob(jobId);
        if (pausedQueueJob) {
          await pausedQueueJob.remove();
          await tagQueries.updateTagCount(
            pausedQueueJob.data.tagId,
            "decrement"
          );
          return { jobId, queue: "paused" };
        }

        logger.info(`Job ${jobId} not found in any queue`);
        return null;
      });

      const results = await Promise.all(removalPromises);

      return {
        success: true,
        message: "Jobs removed from queues",
        details: results.filter((result) => result !== null),
      };
    } catch (error) {
      logger.error("Failed to remove jobs from queues", error);
      return {
        success: false,
        error: "Failed to remove jobs from queues",
      };
    }
  }
  static async pauseOrders(orderIds: number[]) {
    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    const queryParams = {
      status: "QUEUED",
      orderIds: orderIds,
      includeTotalCount: true,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;
    let totalJobsProcessed = 0;
    let totalJobsPaused = 0;

    const results = await Promise.all(
      jobs.map(async (queueItem: Job) => {
        try {
          totalJobsProcessed++;
          const job = await EmailQueue.getJob(queueItem.id);

          if (!job) {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job not found in EmailQueue",
            };
          }

          const jobState = await job.getState();

          if (jobState !== "delayed") {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job is not in delayed state",
            };
          }

          const timeLeft = await QueueService.getTimeLeft(queueItem.id);

          await PausedQueue.add(
            "paused-job",
            { ...job.data, timeLeft },
            { jobId: queueItem.id }
          );

          await job.remove();

          await queuesQueries.updateStatusQuery(job.data.jobId, {
            status: "PAUSED",
          });

          totalJobsPaused++;
          return {
            jobId: queueItem.id,
            success: true,
          };
        } catch (error) {
          logger.error(`Failed to pause job ${queueItem.id}:`, error);
          return {
            jobId: queueItem.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsPaused,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully paused ${totalJobsPaused} jobs, ${failureCount} failed`,
    };
  }

  static async resumeOrders(orderIds: number[]) {
    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    const queryParams = {
      status: "PAUSED",
      orderIds: orderIds,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);
    const totalJobsFound = jobs.length;
    let totalJobsProcessed = 0;
    let totalJobsResumed = 0;

    if (jobs.length === 0) {
      logger.info("No paused jobs found for the provided orders");
      return {
        successCount: 0,
        failureCount: 0,
        totalJobsFound: 0,
        totalJobsProcessed: 0,
        totalJobsResumed: 0,
        message: "No paused jobs found for the provided orders",
      };
    }

    const results = await Promise.all(
      jobs.map(async (queueItem: Job) => {
        try {
          totalJobsProcessed++;
          const pausedJob = await PausedQueue.getJob(queueItem.id);

          if (!pausedJob) {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job not found in PausedQueue",
            };
          }

          const jobState = await pausedJob.getState();

          if (jobState !== "waiting") {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job is not in waiting state",
            };
          }

          await EmailQueue.add(
            "email-job",
            { ...pausedJob.data },
            {
              jobId: queueItem.id,
              delay: pausedJob.data.timeLeft,
              attempts: pausedJob.data.attempts,
            }
          );

          await pausedJob.remove();

          await queuesQueries.updateStatusQuery(queueItem.id, {
            status: "QUEUED",
          });

          totalJobsResumed++;
          return {
            jobId: queueItem.id,
            success: true,
          };
        } catch (error) {
          logger.error(`Failed to resume job ${queueItem.id}:`, error);
          return {
            jobId: queueItem.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      successCount,
      failureCount,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsResumed,
      message: `Found ${totalJobsFound} jobs, processed ${totalJobsProcessed}, successfully resumed ${totalJobsResumed} jobs, ${failureCount} failed`,
    };
  }
}
