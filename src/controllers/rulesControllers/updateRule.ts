import { RequestHandler, Request, Response } from "express";
import { rulesQueries } from "../../queries/rulesQueries";
import { RuleData } from "../../queries/rulesQueries/updateQuery";
import { RuleType } from "../../queries/rulesQueries/createQuery";

export const updateRule: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {

        const ruleId = Number(req.params.ruleId);
        const { ruleName, ruleType, tagIds } = req.body

        console.log(req.body)

        if (!ruleId || isNaN(ruleId)) {
            res.status(400).json({
                error: true,
                message: "Invalid rule ID",
            });
            return;
        }
        if (ruleType !== undefined) {
            const validRuleTypes: RuleType[] = ['Global', 'Subscriber', 'Product', 'All'];
            if (!validRuleTypes.includes(ruleType as RuleType)) {
                res.status(400).json({
                    error: true,
                    message: "Invalid rule type",
                });
                return;
            }
        }
        const ruleData: RuleData = {};
        if (ruleName !== undefined) ruleData.ruleName = ruleName;
        if (ruleType !== undefined) ruleData.ruleType = ruleType;
        if (tagIds !== undefined) ruleData.tags = tagIds;

        if (Object.keys(ruleData).length === 0) {
            res.status(400).json({
                error: true,
                message: "No update fields provided",
            });
            return;
        }

        const response = await rulesQueries.updateRule(ruleId, ruleData);

        if (response.error) {
            res.status(400).json({
                success: false,
                message: `${response.error}`,
            });
        }

        res.status(200).json({
            success: true,
            message: "Rule updated",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Server error ${error}`,
        });
    }
};
