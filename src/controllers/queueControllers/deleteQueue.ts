import { Request, RequestHandler, Response } from "express";
import logger from "../../utils/logger";
import { queuesQueries } from "../../queries/queuesQueries";
import { QueueService } from "../../services/queueService";
import { RevalidateService } from "../../services/revalidateNext";

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

    const queueItem = await QueueService.getJobFromQueues(jobId);

    if (!queueItem) {
      await RevalidateService.revalidateQueue();
      res.status(404).json({
        success: false,
        message: `Job ${jobId} not found in any queue`,
      });
    }

    const deleteBullQueue = queueItem
      ? queueItem?.job?.remove()
      : Promise.resolve();
    const deleteDynamoDB = queuesQueries.deleteQueue(jobId);

    const [bullResult, dynamoResult] = await Promise.all([
      deleteBullQueue,
      deleteDynamoDB,
    ]);

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
