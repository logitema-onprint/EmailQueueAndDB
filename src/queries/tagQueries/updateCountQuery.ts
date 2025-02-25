import { tagQueries } from ".";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

type CountOperation = "increment" | "decrement";

export async function updateTagCount(
  tagId: number,
  operation: CountOperation,
  count: number = 1
) {
  try {
    const tag = await tagQueries.getTag(tagId);
    if (tag.error) {
      return {
        success: false,
        error: tag.error
      };
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        jobsCount:
          operation === "increment"
            ? { increment: count }
            : { decrement: count },
      },
    });

    return {
      success: true,
      data: updatedTag,
    };
  } catch (error) {
    logger.error(`Failed to update tag count ${tagId}: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update tag job count",
    };
  }
}