import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function findRulesByProductId(productId: number) {
  try {
    const rules = await prisma.rule.findMany({
      where: {
        productId: productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (rules.length === 0) {
      logger.info(`No rules found for product ${productId}`);
      return {
        success: true,
        data: [],
        message: `No rules found for product ${productId}`,
      };
    }

    logger.success(`Found ${rules.length} rules for product ${productId}`);

    return {
      success: true,
      data: rules,
    };
  } catch (error) {
    logger.error(`Failed to find rules for product ${productId}`, error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve rules",
    };
  }
}
