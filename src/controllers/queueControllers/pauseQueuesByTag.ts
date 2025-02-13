import { Request, RequestHandler, Response } from "express";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { PausedQueue } from "../../queues/pausedQueue";
import { QueueService } from "../../services/queueService";

export const pauseQueuesByTag: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tagId } = req.params;
    logger.info(tagId);

    if (!tagId) {
      res.status(400).json({
        success: false,
        message: "Missing tagId",
      });
      return;
    }
    const allQueues = [];
    let lastEvaluatedKey;

    do {
      const result = await queuesQueries.getByStatusAndTag(
        tagId,
        "QUEUED",
        100,
        lastEvaluatedKey
      );
      allQueues.push(...(result.items || []));
      lastEvaluatedKey = result.lastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (allQueues.length === 0) {
      res.status(404).json({
        success: false,
        message: "No active jobs found for this tag",
      });
      return;
    }

    const results = await Promise.all(
      allQueues.map(async (queueItem) => {
        try {
          const job = await EmailQueue.getJob(queueItem.jobId);

          if (!job) {
            return {
              jobId: queueItem.jobId,
              success: false,
              error: "Job not found in EmailQueue",
            };
          }

          const jobState = await job.getState();
          if (jobState !== "delayed") {
            return {
              jobId: queueItem.jobId,
              success: false,
              error: "Job is not in delayed state",
            };
          }

          const timeLeft = await QueueService.getTimeLeft(queueItem.jobId);

          await PausedQueue.add(
            "paused-job",
            { ...job.data, timeLeft, attempts: 3 },
            { jobId: queueItem.jobId }
          );

          await job.remove();

          await queuesQueries.updateStatusQuery(queueItem.jobId, "PAUSED");

          return {
            jobId: queueItem.jobId,
            success: true,
          };
        } catch (error) {
          logger.error(`Failed to pause job ${queueItem.jobId}:`, error);
          return {
            jobId: queueItem.jobId,
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
      results,
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
