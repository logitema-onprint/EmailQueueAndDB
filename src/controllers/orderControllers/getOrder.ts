import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getOrder: RequestHandler = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await orderQueries.getOrder(orderId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    const transformedData = serializeBigInt(result.data);
    res.status(200).json({
      success: true,
      data: transformedData,
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    logger.error("Failed to get orders by agent and tag", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};
