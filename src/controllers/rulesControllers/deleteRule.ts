import { RequestHandler, Request, Response } from "express";
import { rulesQueries } from "../../queries/rulesQueries";

export const deleteRule: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const ruleId = Number(req.params.ruleId);

    if (!ruleId || isNaN(ruleId)) {
      res.status(400).json({
        error: true,
        message: "Invalid or missing rule ID",
      });
      return;
    }

    const response = await rulesQueries.deleteRule(ruleId);

    if (response.error) {
      res.status(400).json({
        success: false,
        message: `${response.error}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Rule deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
