import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export type RuleType = 'Global' | 'Subscriber' | 'Product' | 'All';

export interface RulesData {
  ruleName: string;
  ruleType: RuleType;
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
