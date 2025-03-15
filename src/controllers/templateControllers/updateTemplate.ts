import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { templateQueries } from "../../queries/templateQueries";

export const updateTemplate: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { htmlUrl, jsonUrl, templateName } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Template ID is required",
      });
      return;
    }

    if (!htmlUrl || !jsonUrl || !templateName) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const updateData = {
      htmlUrl,
      jsonUrl,
      templateName,
    };

    const updatedTemplate = await templateQueries.updateTemplate(
      Number(id),
      updateData
    );

    if (!updatedTemplate.success) {
      res.status(400).json({
        success: false,
        message: updatedTemplate.message,
      });
      return;
    }

    logger.success(`Template ${id} updated successfully`);
    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate.updatedTemplate,
    });
  } catch (error) {
    logger.error("Failed to update template", error);

    res.status(500).json({
      success: false,
      message: "Failed to update template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
