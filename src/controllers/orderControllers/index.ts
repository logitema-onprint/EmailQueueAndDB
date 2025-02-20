import { addTagsToOrders } from "./addTagsToOrders";
import { createOrder } from "./createOrder";
import { deleteManyOrders } from "./deleteManyOrders";
import { deleteOrder } from "./deleteOrder";
import { getAllOrders } from "./getAllOrders";
import { getFilteredOrders } from "./getFilteredOrders";
import { getOrder } from "./getOrder";
import { pauseManyOrders } from "./pasueManyOrders";
import { resumeManyOrders } from "./resumeManyOrders";

const orderController = {
  createOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getFilteredOrders,
  deleteManyOrders,
  addTagsToOrders,
  pauseManyOrders,
  resumeManyOrders
};

export default orderController;
