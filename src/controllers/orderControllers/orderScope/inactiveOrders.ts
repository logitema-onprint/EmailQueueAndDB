import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../../services/queueService";
import { orderQueries } from "../../../queries/orderQueries";
import { validateAndGetExistingOrders } from "../../../helpers/validateAndGetOrders";
import logger from "../../../utils/logger";

export const inactiveSelectedOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Mising required fields",
      });
      return;
    }
    const { existingOrderIds, missingOrderIds } =
      await validateAndGetExistingOrders(orderIds);

    if (existingOrderIds.length === 0) {
      logger.warn("No existing orders");
      res.status(400).json({
        success: false,
        message: "No existing order/s with provided orderIDs",
      });
      return;
    }

    const jobsResult = await QueueService.makeInactiveOrders(existingOrderIds);

    const message =
      missingOrderIds.length > 0
        ? `Successfully inactive: ${jobsResult.totalJobsRemoved} jobs and ${
            existingOrderIds.length
          } orders. Missing orders: ${missingOrderIds.join(", ")}`
        : `Successfully inactive: ${jobsResult.totalJobsRemoved} jobs and ${existingOrderIds.length} orders`;

    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed inactive selected orders ${error}`,
    });
  }
};
