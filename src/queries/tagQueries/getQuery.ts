import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getTag(tagId: number) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new Error(`No tag found with ID ${tagId}`);
    }

    return {
      success: true,
      data: tag,
    };
  } catch (error) {
    logger.error(`Failed to get tag: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
