import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface tagData {
  tagName: string;
  scheduledFor: bigint;
  tagType: string;
  templateId?: number
  templateName?: string
}

export async function create(tagData: tagData) {
  try {

    const data: tagData = {
      tagName: tagData.tagName,
      scheduledFor: tagData.scheduledFor,
      tagType: tagData.tagType,
    };

    if (tagData.templateId) {
      data.templateId = tagData.templateId;
    }

    if (tagData.templateName) {
      data.templateName = tagData.templateName
    }
    const result = await prisma.tag.create({
      data: data
    });

    logger.success(`Tag: ${result.tagName} ${result.id} created`);
    return {
      success: true,
      tag: result
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create tag ${error}`,
    };
  }
}