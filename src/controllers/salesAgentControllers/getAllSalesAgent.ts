import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { serializeBigInt } from "../../helpers/serializeBigInt";
import { salesAgentQueries } from "../../queries/salesAgentQueries";

export const getAllSalesAgent: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await salesAgentQueries.getAll();

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Failed to retrieve salesAents",
      });
      return;
    }

    res.status(200).json({
      success: true,
      salesAgents: result.data,
    });
  } catch (error) {
    logger.error("Failed to get sales agents", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales agents",
    });
  }
};
