import { Request, RequestHandler, Response } from "express";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { PausedQueue } from "../../queues/pausedQueue";
import { QueueService } from "../../services/queueService";
import { Job } from "@prisma/client";

export const pauseQueuesByTag: RequestHandler = async (
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
      status: "QUEUED",
      tagIds: tags,
      includeTotalCount: true,
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

    res.status(200).json({
      success: true,
      message: `Successfully paused ${successCount} jobs, ${failureCount} failed`,
    });
  } catch (error) {
    logger.error("Failed to pause jobs by tag", error);
    res.status(500).json({
      success: false,
      message: "Failed to pause jobs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
