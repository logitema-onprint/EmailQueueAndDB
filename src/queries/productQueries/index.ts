import { createQuery } from "./createProduct";
import { getAll } from "./getAllProducts";
import { updateProductMetrics } from "./updateProductMetrics";

export const productQueries = {
  createQuery,
  updateProductMetrics,
  getAll
};
