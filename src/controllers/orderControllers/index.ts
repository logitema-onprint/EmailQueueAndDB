import { createOrder } from "./createOrder";
import { deleteManyOrders } from "./deleteManyOrders";
import { deleteOrder } from "./deleteOrder";
import { getAllOrders } from "./getAllOrders";
import { getFilteredOrders } from "./getFilteredOrders";
import { getOrder } from "./getOrder";

const orderController = {
  createOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getFilteredOrders,
  deleteManyOrders
};

export default orderController;
