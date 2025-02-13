import { Request, RequestHandler, Response } from "express";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { PausedQueue } from "../../queues/pausedQueue";
import { QueueService } from "../../services/queueService";
import { Job } from "@prisma/client";

export const resumeQueuesByTag: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tags } = req.body;
    logger.info(tags);

    if (!tags) {
      res.status(400).json({
        success: false,
        message: "Missing tagId",
      });
      return;
    }

    const queryParams = {
      status: "PAUSED",
      tagIds: tags,
    };

    const { jobs } = await queuesQueries.getAllQuery(queryParams);

    if (jobs.length === 0) {
      res.status(404).json({
        success: false,
        message: "No active jobs found for this tag",
      });
      return;
    }

    const results = await Promise.all(
      jobs.map(async (queueItem: Job) => {
        try {
          const pausedJob = await PausedQueue.getJob(queueItem.id);

          if (!pausedJob) {
            return {
              jobId: queueItem.id,
              success: false,
              error: "Job not found in EmailQueue",
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
            status: "PAUSED",
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

    res.status(200).json({
      success: true,
      message: `Successfully resumed ${successCount} jobs, ${failureCount} failed`,
    });
  } catch (error) {
    logger.error("Failed to resume jobs by tag", error);
    res.status(500).json({
      success: false,
      message: "Failed to resume jobs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
