import { Tag } from "@prisma/client";
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

// Helper function to convert BigInt to number safely
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

        // Convert BigInt to number for BullMQ delay
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
    logger.info(processAt);
    const timeLeft = processAt - now;

    return timeLeft > 0 ? timeLeft : 0;
  }

  static async getJobFromQueues(jobId: string) {
    let job = await EmailQueue.getJob(jobId);
    if (job) {
      logger.success(`Job ${jobId} found in EmailQueue`);
    } else {
      job = await PausedQueue.getJob(jobId);
      if (job) {
        logger.success(`Job ${jobId} found in PausedQueue`);
      } else {
        logger.error(`Job ${jobId} not found in any queue, checking DB`);
      }
    }

    logger.debug(jobId);

    const item = await queuesQueries.getQuery(jobId);

    if (item.item === null) {
      return {
        message: `Job not found in Db`,
      };
    }

    logger.success(`Job ${item?.item} found in DB`);

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
          await tagQueries.updateTagCount(emailQueueJob.data.tagId, "decrement");
          return { jobId, queue: 'email' };
        }

        const pausedQueueJob = await PausedQueue.getJob(jobId);
        if (pausedQueueJob) {
          await pausedQueueJob.remove();
          await tagQueries.updateTagCount(pausedQueueJob.data.tagId, "decrement");
          return { jobId, queue: 'paused' };
        }

        logger.info(`Job ${jobId} not found in any queue`);
        return null;
      });

      const results = await Promise.all(removalPromises);

      return {
        success: true,
        message: "Jobs removed from queues",
        details: results.filter(result => result !== null)
      };
    } catch (error) {
      logger.error("Failed to remove jobs from queues", error);
      return {
        success: false,
        error: "Failed to remove jobs from queues",
      };
    }
  }
}
