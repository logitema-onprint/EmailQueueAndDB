import { number } from "zod";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface RulesData {
  ruleName: string;
  ruleType: string;
  tags: number[];
}

export async function createQuery(rulesData: RulesData) {
  try {
    const result = await prisma.rule.create({
      data: {
        ruleName: rulesData.ruleName,
        ruleType: rulesData.ruleType,
        tags: rulesData.tags,
      },
    });
    logger.success(`Rule ${result.ruleName} created`);
  } catch (error) {
    return {
      success: false,
      error: `Failed to create tag ${error}`,
    };
  }
}
