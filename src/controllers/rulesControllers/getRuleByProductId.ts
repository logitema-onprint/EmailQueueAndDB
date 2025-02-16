import { Request, RequestHandler, Response } from "express";

import logger from "../../utils/logger";
import { rulesQueries } from "../../queries/rulesQueries";
import { serializeBigInt } from "../../helpers/serializeBigInt";

export const getRulesByProductId: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = Number(req.params.productId);

    if (!productId || isNaN(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const result = await rulesQueries.findRulesByProductId(productId);

    const tags = await rulesQueries.findRuleTagsByProductId(productId);

    logger.info(tags.data);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    if (result.data?.length === 0) {
      res.status(404).json({
        success: true,
        data: [],
        message: `No rules found for product ${productId}`,
      });
    }
    const transformedData = serializeBigInt(result.data);
    const transformedTags = serializeBigInt(tags.data?.tags);

    res.status(200).json({
      success: true,
      data: transformedData,
      tags: transformedTags,
    });
  } catch (error) {
    logger.error(`Failed to get rules for product`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve rules",
    });
  }
};
