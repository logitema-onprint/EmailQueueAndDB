import { createQuery } from "./createQuery";
import { deleteRule } from "./deleteQuery";
import { getGlobalRule } from "./getGlobalRule";
import { getAllRules } from "./getManyQuery";
import { getRule } from "./getQuery";

export const rulesQueries = {
  createQuery,
  deleteRule,
  getAllRules,
  getRule,
  getGlobalRule,
};
