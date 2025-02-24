import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getAllOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = parseInt(req.query.limit as string) || 25;

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
      });
      return;
    }

    const result = await orderQueries.getAllOrders({
      page,
      limit: itemsPerPage,
      includeTotalCount: true,
    });

    if (!result) {
      res.status(400).json({
        success: false,
        message: "Failed to retrieve orders",
      });
      return;
    }

    const transformedOrders = serializeBigInt(result.orders);

    res.status(200).json({
      success: true,
      items: transformedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.totalCount / itemsPerPage),
        itemsPerPage,
        totalItems: result.totalCount,
        nextPage:
          page < Math.ceil(result.totalCount / itemsPerPage) ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        hasNextPage: page * itemsPerPage < result.totalCount,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    logger.error("Failed to get orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};
