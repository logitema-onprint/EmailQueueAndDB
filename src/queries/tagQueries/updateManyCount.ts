import { tagQueries } from ".";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

type CountOperation = "increment" | "decrement";


export async function updateTagCountMany(
  tagCounts: { id: number; count: number }[],
  operation: CountOperation
) {
  try {

    const updates = await prisma.$transaction(
      tagCounts.map(({ id, count }) =>
        prisma.tag.update({
          where: { id },
          data: {
            jobsCount:
              operation === "increment"
                ? { increment: count }
                : { decrement: count },
          },
        })
      )
    );

    return {
      success: true,
      data: updates,
      count: updates.length
    };
  } catch (error) {
    logger.error(`Failed to bulk update tag counts: ${error}`);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to update tag job counts in bulk",
    };
  }
}
