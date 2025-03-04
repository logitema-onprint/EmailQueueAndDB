import { createQuery } from "./createQuery";
import { deleteRule } from "./deleteQuery";
import { getGlobalRule } from "./getGlobalRule";
import { getAllRules } from "./getManyQuery";
import { getRule } from "./getQuery";
import { updateRule } from "./updateQuery";

export const rulesQueries = {
  createQuery,
  deleteRule,
  getAllRules,
  getRule,
  getGlobalRule,
  updateRule
};
