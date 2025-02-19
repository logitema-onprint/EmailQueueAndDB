import { createOrder } from "./createQuery";
import { deleteFiltered } from "./deleteFiltered";
import { deleteOrder } from "./deleteQuery";
import { getFilteredOrders } from "./getFilteredQuery";
import { getAllOrders } from "./getManyQuery";
import { getOrderIds } from "./getOrdersIds";
import { getOrder } from "./getQuery.ts";

export const orderQueries = {
  createOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  getFilteredOrders,
  deleteFiltered,
  getOrderIds,
};
