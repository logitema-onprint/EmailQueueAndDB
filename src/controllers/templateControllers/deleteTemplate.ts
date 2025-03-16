import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { templateQueries } from "../../queries/templateQueries";

export const deleteTemplate: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await templateQueries.deleteTemplate(Number(id));

    if (!result.success) {
      logger.error("Failed to delete template");
      res.status(400).json({
        success: false,
        message: "Failed to delete Item",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error("Failed to delete Item", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Item",
    });
  }
};
