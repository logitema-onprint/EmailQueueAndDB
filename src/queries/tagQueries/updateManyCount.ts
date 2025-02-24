import { tagQueries } from ".";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

type CountOperation = "increment" | "decrement";

interface TagUpdateResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function updateManyCount(
  tagCounts: { [tagId: number]: number },
  operation: CountOperation,
  totalProcessed: number
) {
  try {
    const result = await prisma.tag.updateMany({
      where: {
        id: { in: Object.keys(tagCounts).map(Number) },
      },
      data: {
        jobsCount:
          operation === "increment"
            ? { increment: totalProcessed }
            : { decrement: totalProcessed },
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error(`Failed to update tag counts: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update tag counts",
    };
  }
}
