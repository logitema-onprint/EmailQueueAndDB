import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../services/queueService";

export const getQueue: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      res.status(404).json({
        success: false,
        message: "Missing jobId",
      });
    }
    const result = await QueueService.getJobFromQueues(jobId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: `Job ${jobId} not found in any queue`,
      });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get job ${error}`,
    });
  }
};
