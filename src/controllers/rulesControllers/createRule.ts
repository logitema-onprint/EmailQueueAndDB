import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { RulesData } from "../../queries/rulesQueries/createQuery";
import { rulesQueries } from "../../queries/rulesQueries";

export const createRule: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { ruleName, tagIds, ruleType } = req.body;

    logger.info(req.body);

    if (!ruleName || !tagIds || !ruleType) {
      res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    const ruleData: RulesData = {
      ruleName,
      tags: tagIds,
      ruleType,
    };

    const response = await rulesQueries.createQuery(ruleData);

    if (response?.error) {
      res.status(400).json({
        success: false,
        message: `${response.error}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Rule created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
