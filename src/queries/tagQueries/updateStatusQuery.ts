import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function updateTagStatus(tagId: number, isActive: boolean) {
  try {
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        isActive: isActive,
      },
    });

    logger.success(`Tag ${tagId} status updated to ${isActive}`);

    return {
      success: true,
      data: updatedTag,
    };
  } catch (error) {
    logger.error(`Failed to update tag status: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update tag status",
    };
  }
}
