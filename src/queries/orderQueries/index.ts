import { createOrder } from "./createQuery";
import { deleteFiltered } from "./deleteFiltered";
import { deleteOrder } from "./deleteQuery";
import { getFilteredOrders } from "./batch/getFilteredQuery";
import { getAllOrders } from "./getManyQuery";
import { getOrderIds } from "./getOrdersIds";
import { getOrder } from "./getQuery.ts";
import { deleteOrdersById } from "./batch/deleteOrderById";

export const orderQueries = {
  createOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  getFilteredOrders,
  deleteFiltered,
  getOrderIds,
  deleteOrdersById
};
