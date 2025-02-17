import { createRule } from "./createRule";
import { deleteRule } from "./deleteRule";
import { getRule } from "./getRule";
import { getRulesByProductId } from "./getRuleByProductId";
import { getRules } from "./getRules";

export const ruleController = {
  createRule,
  getRule,
  deleteRule,
  getRulesByProductId,
  getRules
};
