import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function deleteRule(ruleId: number) {
  try {
    const existingRule = await prisma.rule.findUnique({
      where: { id: ruleId },
    });

    if (!existingRule) {
      throw new Error(`Rule with ID ${ruleId} does not exist`);
    }

    const res = await prisma.rule.delete({
      where: { id: ruleId },
    });

    logger.success(`Rule with id: ${res.id} deleted`);

    return {
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to delete rule: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to delete rule ${error}`,
    };
  }
}
