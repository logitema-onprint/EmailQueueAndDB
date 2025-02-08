import { Request, RequestHandler, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import logger from "../../utils/logger";
import { queuesQueries } from "../../queries/queuesQueries";
import { PausedQueue } from "../../queues/pausedQueue";
import { QueueService } from "../../services/queueService";
import { log } from "console";

export const pauseQueue: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: "Missing jobId",
      });
      return;
    }

    const job = await EmailQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    const timeLeft = await QueueService.getTimeLeft(jobId);
    logger.info("Time left:", timeLeft);

    await PausedQueue.add(
      "paused-job",
      { ...job.data, timeLeft, attempts: 3 },
      { jobId: jobId }
    );
    await job.remove();
    await queuesQueries.updateStatusQuery(jobId, "PAUSED");

    logger.info(`Job ${jobId} paused`);

    res.status(200).json({
      success: true,
      message: "Job successfully paused",
    });
  } catch (error) {
    logger.error("Failed to pause job", error);

    res.status(500).json({
      success: false,
      message: "Failed to pause job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
