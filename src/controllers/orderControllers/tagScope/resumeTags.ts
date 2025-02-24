import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../../services/queueService";

export const resumeTags: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds, tagIds } = req.body;

    if (
      !orderIds ||
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      !tagIds ||
      !Array.isArray(tagIds) ||
      tagIds.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Mising required fields",
      });
      return;
    }

    const jobsResult = await QueueService.resumeOrders(orderIds, tagIds);

    if (jobsResult.successCount === 0) {
      res.status(400).json({
        success: false,
        error: `Failed resume tags in orders ${jobsResult.message}`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Successfufly resumed:  ${jobsResult.totalJobsResumed} jobs`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed add tags ${error}`,
    });
  }
};
