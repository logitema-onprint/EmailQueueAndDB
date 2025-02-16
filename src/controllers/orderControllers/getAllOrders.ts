import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getAllOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { page = 1, limit = 25, includeTotalCount = true } = req.query;

    const result = await orderQueries.getAllOrders({
      page: Number(page),
      limit: Number(limit),
      includeTotalCount: Boolean(includeTotalCount),
    });

    if (!result) {
      res.status(400).json({
        success: false,
        message: result,
      });
    }

    const transformedOrders = serializeBigInt(result.orders);

    res.status(200).json({
      success: true,
      data: {
        orders: transformedOrders,
        totalCount: result.totalCount,
      },
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    logger.error("Failed to get orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};
