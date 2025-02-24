import { RequestHandler, Response, Request } from "express";
import logger from "../../../utils/logger";
import { BatchQueue } from "../../../queues/batchQueue";

export const inactiveFilteredOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { filters, tagIds } = req.body;
    console.log("fired");
    logger.info(req.body);

    if (!filters) {
      res.status(400).json({
        success: false,
        message: "Missing filters in request body",
      });
      return;
    }

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Missing or invalid tags in request body",
      });
      return;
    }

    const job = await BatchQueue.add(
      "inactive-tags",
      {
        type: "inactive-tags",
        filters,
        tagIds,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    res.status(202).json({
      success: true,
      message: "Tag inactive process started",
      jobId: job.id,
    });
  } catch (error) {
    logger.error("Failed to queue tag inactive", error);
    res.status(500).json({
      success: false,
      message: "Failed to queue tag inactive",
    });
  }
};
