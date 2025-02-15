// In tags service
import { queuesQueries } from "../queries/queuesQueries";
import { EmailQueue } from "../queues/emailQueue";
import { PausedQueue } from "../queues/pausedQueue";
import { QueueService } from "./queueService";
import logger from "../utils/logger";
import { Job } from "@prisma/client";

export class TagService {
  static async pauseJobsByTags(tags: number[]) {
    if (!tags || tags.length === 0) {
      throw new Error("No tags provided");
    }
    const queryParams = {
      status: "QUEUED",
      tagIds: tags,
      includeTotalCount: true,
    };
    const { jobs } = await queuesQueries.getAllQuery(queryParams);

    if (jobs.length === 0) {
      logger.info("No active jobs found for the provided tags");
      return {
        successCount: 0,
        failureCount: 0,
        message: "No active jobs found for the provided tags",
      };
    }

    const results = await Promise.all(
      jobs.map(async (queueItem: Job) => {
        try {
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
            { ...job.data, timeLeft, attempts: 3 },
            { jobId: queueItem.id }
          );

          await job.remove();

          await queuesQueries.updateStatusQuery(job.data.jobId, {
            status: "PAUSED",
          });

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
      message: `Successfully paused ${successCount} jobs, ${failureCount} failed`,
    };
  }
  static async resumeJobsByTags(tags: number[]) {
    if (!tags || tags.length === 0) {
      throw new Error("No tags provided");
    }
    const queryParams = {
      status: "PAUSED",
      tagIds: tags,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);

    if (jobs.length === 0) {
      logger.info("No paused jobs found for the provided tags");
      return {
        successCount: 0,
        failureCount: 0,
        message: "No paused jobs found for the provided tags",
      };
    }
    const results = await Promise.all(
      jobs.map(async (queueItem: Job) => {
        try {
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
      message: `Successfully resumed ${successCount} jobs, ${failureCount} failed`,
    };
  }
}
