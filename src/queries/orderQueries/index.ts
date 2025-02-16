import { createOrder } from "./createQuery";
import { getAllOrders } from "./getManyQuery";
import { getOrder } from "./getQuery.ts";

export const orderQueries = {
  createOrder,
  getAllOrders,
  getOrder,
};
