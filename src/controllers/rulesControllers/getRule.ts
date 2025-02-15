import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";
import { rulesQueries } from "../../queries/rulesQueries";

export const getRule: RequestHandler = async (req: Request, res: Response) => {
  try {
    const ruleId = Number(req.params.ruleId);
    if (!ruleId || isNaN(ruleId)) {
      res.status(400).json({
        error: true,
        message: "Invalid or missing rule ID",
      });
    }

    const query = await rulesQueries.getRule(ruleId);
    if (query.error) {
      res.status(400).json({
        success: false,
        message: `${query.error}`,
      });
    }

    res.status(200).json({
      success: true,
      data: query.data,
    });
  } catch (error) {
    res.status(500).json({
      error: `Server error ${error}`,
    });
  }
};
