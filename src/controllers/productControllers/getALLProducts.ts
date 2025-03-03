import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { salesAgentQueries } from "../../queries/salesAgentQueries";
import { productQueries } from "../../queries/productQueries";

export const getAllProducts: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await productQueries.getAll();

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Failed to retrieve salesAents",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Failed to get sales agents", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales agents",
    });
  }
};
