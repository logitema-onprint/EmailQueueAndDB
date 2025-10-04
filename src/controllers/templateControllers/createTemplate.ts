import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { TemplateData } from "../../queries/templateQueries/createTemplate";
import { templateQueries } from "../../queries/templateQueries";

export const createTemplate: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { htmlUrl, jsonUrl, templateName, templateType, templateSubject } = req.body;

    if (!htmlUrl || !jsonUrl || !templateName || !templateType || !templateSubject) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const data: TemplateData = {
      type: templateType,
      htmlUrl,
      jsonUrl,
      templateName,
      templateSubject,
    };

    const createTemplate = await templateQueries.createTemplate(data);

    if (createTemplate.error) {
      res.status(409).json({
        success: false,
        message: createTemplate.message,
        errorType: createTemplate.error,
      });
      return;
    }
    logger.success(`New ${templateName} created`);
    res.status(201).json({
      success: true,
      message: `Successfully created template`,
      data: createTemplate,
    });
  } catch (error) {
    logger.error("Failed to create template", error);

    res.status(500).json({
      success: false,
      message: "Failed to create template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
