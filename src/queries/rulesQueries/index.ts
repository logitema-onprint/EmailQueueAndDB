import { createQuery } from "./createQuery";
import { deleteRule } from "./deleteQuery";
import { getAllRules } from "./getManyQuery";
import { getRule } from "./getQuery";
import { findRulesByProductId } from "./getRuleByProductId";
import { findRuleTagsByProductId } from "./getTagsByProductId";

export const rulesQueries = {
  createQuery,
  deleteRule,
  getAllRules,
  getRule,
  findRulesByProductId,
  findRuleTagsByProductId,
};
