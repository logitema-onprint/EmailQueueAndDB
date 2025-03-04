import prisma from "../../services/prisma";
import logger from "../../utils/logger";
import { RuleType } from "./createQuery";

export interface RuleData {
    ruleType?: RuleType;
    ruleName?: string;
    tags?: number[];
}

export async function updateRule(ruleId: number, ruleData: RuleData) {
    try {
        if (Object.keys(ruleData).length === 0) {
            throw new Error("No update fields provided");
        }

        logger.info(ruleData);

        const updatedRule = await prisma.rule.update({
            where: { id: ruleId },
            data: {
                ...(ruleData.ruleName !== undefined && { ruleName: ruleData.ruleName }),
                ...(ruleData.ruleType !== undefined && { ruleType: ruleData.ruleType }),
                ...(ruleData.tags !== undefined && { tags: ruleData.tags }),
            },
        });

        logger.success(`Rule with id: ${updatedRule.id} updated`);

        return {
            success: true,
            data: updatedRule,
        };
    } catch (error) {
        logger.error(`Failed to update rule: ${error}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update rule",
        };
    }
}