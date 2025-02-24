import prisma from "../../services/prisma";
import logger from "../../utils/logger";

interface UpdateTagData {
  tagName?: string;
  scheduledFor?: number;
  jobsCount?: number;
}

export async function updateTag(tagId: number, data: UpdateTagData) {
  try {
    if (Object.keys(data).length === 0) {
      throw new Error("No update fields provided");
    }

    logger.info(data);

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(data.tagName && { tagName: data.tagName }),
        ...(typeof data.jobsCount === 'number' && { jobsCount: data.jobsCount }), 
        ...(data.scheduledFor !== undefined && {
          scheduledFor: data.scheduledFor,
        }),
      },
    });

    logger.success(`Tag with id: ${updatedTag.id} updated`);

    return {
      success: true,
      data: updatedTag,
    };
  } catch (error) {
    logger.error(`Failed to update tag: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    };
  }
}
