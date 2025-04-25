import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { TemplateData } from "../../queries/templateQueries/createTemplate";
import { templateQueries } from "../../queries/templateQueries";
import { error } from "console";

export const createTemplate: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { htmlUrl, jsonUrl, templateName, templateType } = req.body 

    if (!htmlUrl || !jsonUrl || !templateName || !templateType) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return; // Added return statement to prevent further execution
    }
    
    const data: TemplateData = {
      type: templateType, // This maps templateType from req.body to type in TemplateData
      htmlUrl,
      jsonUrl,
      templateName,
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
