import { tagQueries } from ".";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

type CountOperation = "increment" | "decrement";

export async function updateTagCount(tagId: number, operation: CountOperation) {
  try {
    const tag = await tagQueries.getTag(tagId);
    if (tag.error) {
      return;
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        jobsCount:
          operation === "increment" ? { increment: 1 } : { decrement: 1 },
      },
    });

    logger.success(`Tag ${tagId} job count ${operation}d`);

    return {
      success: true,
      data: updatedTag,
    };
  } catch (error) {
    logger.error(`Failed to update tag count: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update tag job count",
    };
  }
}
