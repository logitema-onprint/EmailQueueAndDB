import { Request, RequestHandler, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import logger from "../../utils/logger";
import { queuesQueries } from "../../queries/queuesQueries";

export const deleteQueue: RequestHandler = async (
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

    const deleteBullQueue = job ? job.remove() : Promise.resolve();
    const deleteDynamoDB = queuesQueries.deleteQueue(jobId);

    const [bullResult, dynamoResult] = await Promise.all([
      deleteBullQueue,
      deleteDynamoDB,
    ]);

    if (dynamoResult.error) {
      logger.info(`Job ${jobId} not found in DynamoDB`);
      res.status(404).json({
        success: false,
        message: dynamoResult.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Job successfully removed",
    });
  } catch (error) {
    logger.error("Failed to remove job", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
