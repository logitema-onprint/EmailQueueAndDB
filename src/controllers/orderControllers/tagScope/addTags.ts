import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../../services/queueService";
import logger from "../../../utils/logger";
import { validateAndGetExistingOrders } from "../../../helpers/validateAndGetOrders";
import { validateAndGetTags } from "../../../helpers/validateAndGetTags";

export const addTags: RequestHandler = async (req: Request, res: Response) => {
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
        message: "Missing required fields",
      });
      return;
    }

    const { existingOrderIds, missingOrderIds, totalOrders } =
      await validateAndGetExistingOrders(orderIds);

    if (existingOrderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "None of the provided orders exist",
      });
      return;
    }

    const serializedTags = await validateAndGetTags(tagIds);

    logger.info(
      `Found ${existingOrderIds.length} existing orders out of ${totalOrders}`
    );

    const createQueues = await QueueService.createQueues(
      existingOrderIds,
      serializedTags
    );

    if (!createQueues.success) {
      res.status(400).json({
        success: false,
        error: `Failed add tags to orders`,
      });
      logger.error(createQueues.error);
      return;
    }

    res.status(200).json({
      success: true,
      message: `Created queues for ${existingOrderIds.length}/${totalOrders} orders`,
      totalCount: createQueues.totalJobsCreated,
      processedOrders: existingOrderIds,
      notFoundOrders: missingOrderIds,
      notice:
        missingOrderIds.length > 0
          ? `Please verify the existence of the following order(s): ${missingOrderIds.join(
              ", "
            )}`
          : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed add tags ${error}`,
    });
  }
};
