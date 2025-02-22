import { addTagsToOrders } from "./addTagsToFilteredOrders";
import { createOrder } from "./createOrder";
import { deleteManyOrders } from "./deleteManyOrders";
import { deleteOrder } from "./deleteOrder";
import { getAllOrders } from "./getAllOrders";
import { getFilteredOrders } from "./getFilteredOrders";
import { getOrder } from "./getOrder";
import { inactiveManyOrders } from "./inactiveManyOrders";
import { pauseManyOrders } from "./pasueManyOrders";
import { pauseTagsToFilteredOrders } from "./pauseTagsToFilteredOrders";
import { removeTagsFromOrders } from "./removeTagsToFilteredOrders";
import { resumeManyOrders } from "./resumeManyOrders";
import { resumeTagsToFilteredOrders } from "./resumeTagsToFilteredOrders";

const orderController = {
  createOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getFilteredOrders,
  deleteManyOrders,
  addTagsToOrders,
  pauseManyOrders,
  resumeManyOrders,
  inactiveManyOrders,
  removeTagsFromOrders,
  pauseTagsToFilteredOrders,
  resumeTagsToFilteredOrders,
};

export default orderController;
