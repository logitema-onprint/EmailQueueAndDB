import { Request, RequestHandler, Response } from "express";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { PausedQueue } from "../../queues/pausedQueue";
import { QueueService } from "../../services/queueService";

export const resumeQueuesByTag: RequestHandler = async (
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
        "PAUSED",
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
          const pausedJob = await PausedQueue.getJob(queueItem.jobId);

          if (!pausedJob) {
            return {
              jobId: queueItem.jobId,
              success: false,
              error: "Job not found in EmailQueue",
            };
          }

          const jobState = await pausedJob.getState();
          if (jobState !== "waiting") {
            return {
              jobId: queueItem.jobId,
              success: false,
              error: "Job is not in waiting state",
            };
          }

          await EmailQueue.add(
            "email-job",
            { ...pausedJob.data },
            {
              jobId: queueItem.jobId,
              delay: pausedJob.data.timeLeft,
              attempts: pausedJob.data.attempts,
            }
          );

          await pausedJob.remove();

          await queuesQueries.updateStatusQuery(queueItem.jobId, "QUEUED");

          return {
            jobId: queueItem.jobId,
            success: true,
          };
        } catch (error) {
          logger.error(`Failed to resume job ${queueItem.jobId}:`, error);
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
      message: `Successfully resumed ${successCount} jobs, ${failureCount} failed`,
      results,
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
