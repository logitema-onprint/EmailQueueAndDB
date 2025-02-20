import { Request, RequestHandler, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import logger from "../../utils/logger";
import { queuesQueries } from "../../queries/queuesQueries";
import { PausedQueue } from "../../queues/pausedQueue";

export const resumeQueue: RequestHandler = async (
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

    const pausedJob = await PausedQueue.getJob(jobId);

    if (!pausedJob) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    await EmailQueue.add("email-job", pausedJob.data, {
      jobId: jobId,
      delay: pausedJob.data.timeLeft,
      attempts: pausedJob.data.attempts,
    });

    await pausedJob.remove();
    await queuesQueries.updateStatusQuery(jobId, { status: "QUEUED" })
    

    logger.info(`Job ${jobId} resumed`);

    res.status(200).json({
      success: true,
      message: "Job successfully resumed",
    });
  } catch (error) {
    logger.error("Failed to resume job", error);

    res.status(500).json({
      success: false,
      message: "Failed to resume job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
