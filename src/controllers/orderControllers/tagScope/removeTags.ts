import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../../services/queueService";

export const removeTags: RequestHandler = async (
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

    const jobsResult = await QueueService.removeTagsFromOrders(
      orderIds,
      tagIds
    );

    if (jobsResult.successCount === 0) {
      res.status(400).json({
        success: false,
        error: `Failed remove tags to orders ${jobsResult.message}`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Successfufly removed:  ${jobsResult.totalJobsRemoved} jobs`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed add tags ${error}`,
    });
  }
};
