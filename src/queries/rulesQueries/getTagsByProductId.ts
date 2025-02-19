import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function findRuleTagsByProductId(productId: number) {
  try {
    const rules = await prisma.rule.findMany({
      where: { productId },
    });

    if (rules.length === 0) {
      logger.info(`No rules found for product ID ${productId}`);
      return {
        success: false,
        message: `No rules found for product ID ${productId}`,
      };
    }

    const tagIds = rules.flatMap((rule) => rule.tags || []);

    const tags =
      tagIds.length > 0
        ? await prisma.tag.findMany({
            where: {
              id: { in: tagIds },
            },
            select: {
              id: true,
              tagName: true,
              scheduledFor: true,
            },
          })
        : [];

    return {
      success: true,
      data: {
        rules,
        tags,
      },
    };
  } catch (error) {
    logger.error(
      `Failed to find rules and tags for product ID ${productId}`,
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve rules and tags",
    };
  }
}
