import { createRule } from "./createRule";
import { deleteRule } from "./deleteRule";
import { getRule } from "./getRule";
import { getRulesByProductId } from "./getRuleByProductId";

export const ruleController = {
  createRule,
  getRule,
  deleteRule,
  getRulesByProductId,
};
