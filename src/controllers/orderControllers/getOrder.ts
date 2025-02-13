import { RequestHandler, Request, Response } from "express";
import { BullMQServices } from "../../services/bullmqService";
import { tagQueries } from "../../queries/tagQueries";
import { v4 as uuidv4 } from "uuid";
import { Order } from "../../types/orderApi";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";

export const getOrderByStatusTagId: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { tagId, salesAgentId } = req.body;
    console.log(req.body)
    if (!tagId || !salesAgentId) {
      res.status(404).json({
        message: "Missing required fields",
      });
    }

    const result = await orderQueries.getByAgentAndTagId(salesAgentId, tagId);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
      logger.info(result.error);
      return;
    }
    res.status(200).json({
      success: true,
      message: "Good job",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed have fun",
    });
  }
};
