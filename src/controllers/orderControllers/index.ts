import { createOrder } from "./createOrder";
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
};

export default orderController;
