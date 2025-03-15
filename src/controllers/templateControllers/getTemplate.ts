import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { templateQueries } from "../../queries/templateQueries";

export const getTemplate: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await templateQueries.getTemplate(Number(id));

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Failed to get Tempalte",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Failed to get Tempalte", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Tempalte",
    });
  }
};
