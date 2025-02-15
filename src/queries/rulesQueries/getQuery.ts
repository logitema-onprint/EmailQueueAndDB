import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getRule(ruleId: number) {
  try {
    const rule = await prisma.rule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new Error(`No rule found with ID ${ruleId}`);
    }

    return {
      success: true,
      data: rule,
    };
  } catch (error) {
    logger.error(`Failed to get rule: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
