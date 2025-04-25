import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface TemplateData {
  templateName: string;
  type: string;
  htmlUrl: string;
  jsonUrl: string;
}

export async function createTemplate(templateData: TemplateData) {
  try {
    const template = await prisma.template.create({
      data: {
        type: templateData.type,
        templateName: templateData.templateName,
        htmlUrl: templateData.htmlUrl,
        jsonUrl: templateData.jsonUrl,
      },
    });

    if (!template) {
      logger.error("Failed to create template");
    }
    return {
      success: true,
      message: "Template created",
      template: template,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: `Template name "${templateData.templateName}" already exists`,
          error: "DUPLICATE_TEMPLATE_NAME",
        };
      }
    }
    return {
      success: false,
      message: `Failed to create template ${error}`,
      error: error,
    };
  }
}
