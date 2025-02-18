import { Request, RequestHandler, Response } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getFilteredOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = 25;
    const filters = req.body;

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
      });
    }

    logger.info(filters);

    const data = await orderQueries.getFilteredOrders(
      filters,
      page,
      itemsPerPage
    );

    if (!data.success) {
      res.status(400).json({
        success: false,
        message: data.error,
      });
    }

    const transformedData = serializeBigInt(data.data);

    if (data.totalCount)
      res.status(200).json({
        success: true,
        data: transformedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.totalCount / itemsPerPage),
          itemsPerPage,
          totalItems: data.totalCount,
          nextPage:
            page < Math.ceil(data.totalCount / itemsPerPage) ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
          hasNextPage: page * itemsPerPage < data.totalCount,
          hasPreviousPage: page > 1,
        },
      });
  } catch (error) {
    logger.error("Failed to get orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};
