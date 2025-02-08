import { RequestHandler, Request, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";

export const getQueue: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      res.status(404).json({
        success: false,
        message: "Missing jobId",
      });
    }
    const job = await EmailQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        message: `Job ${jobId} not found`,
      });
    }
    logger.success(`Job ${jobId} found`);
    const item = await queuesQueries.getQuery(jobId);
    logger.success(`Job ${item?.item?.jobId} found in DynamoDB`);
    res.status(200).json({
      success: true,
      data: item.item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get job ${error}`,
    });
  }
};
