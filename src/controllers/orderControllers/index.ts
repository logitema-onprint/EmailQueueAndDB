import { addTagsToOrders } from "./batch/addTagsToFilteredOrders";
import { createOrder } from "./createOrder";
import { deleteManyOrders } from "./batch/deleteManyOrders";
import { deleteOrder } from "./deleteOrder";
import { getAllOrders } from "./getAllOrders";
import { getOrder } from "./getOrder";
import { inactiveManyOrders } from "./inactiveManyOrders";
import { pauseManyOrders } from "./batch/pasueManyOrders";
import { pauseTagsToFilteredOrders } from "./batch/pauseTagsToFilteredOrders";
import { removeTagsFromOrders } from "./batch/removeTagsToFilteredOrders";
import { resumeManyOrders } from "./batch/resumeManyOrders";
import { resumeTagsToFilteredOrders } from "./batch/resumeTagsToFilteredOrders";
import { getFilteredOrders } from "./getFilteredOrders";
import { addTags } from "./tagScope/addTags";
import { removeTags } from "./tagScope/removeTags";
import { pauseTags } from "./tagScope/pauseTags";
import { resumeTags } from "./tagScope/resumeTags";
import { inactiveTags } from "./tagScope/inactiveTags";
import { deleteSelectedOrders } from "./orderScope/deleteOrders";

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
  addTags,
  removeTags,
  pauseTags,
  resumeTags,
  inactiveTags,
  deleteSelectedOrders
};

export default orderController;
