import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../services/queueService";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getQueue: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log("Fires");
    const { jobId } = req.params;
    if (!jobId) {
      res.status(404).json({
        success: false,
        message: "Missing jobId",
      });
    }
    const result = await QueueService.getJobFromQueues(jobId);
    const state = await result?.job?.getState();
    logger.info("Jobstate: ", state);

    if (!result) {
      res.status(404).json({
        success: false,
        message: `Job ${jobId} not found in any queue`,
      });
    }

    const transformedResult = serializeBigInt(result);
    res.status(200).json({
      success: true,
      data: transformedResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get job ${error}`,
    });
  }
};
