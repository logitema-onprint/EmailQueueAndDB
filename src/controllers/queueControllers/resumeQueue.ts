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

    console.log(pausedJob);

    await EmailQueue.add(pausedJob?.data, {
      jobId: jobId,
      delay: pausedJob.data.timeLeft,
      attempts: pausedJob.data.attempts,
    });
    await pausedJob.remove();
    await queuesQueries.updateStatusQuery(jobId, "ACTIVE");

    logger.info(`Job ${jobId} resumed`);

    res.status(200).json({
      success: true,
      message: "Job successfully resumed",
    });
  } catch (error) {
    logger.error("Failed to resumed job", error);

    res.status(500).json({
      success: false,
      message: "Failed to resumed job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
