import { addTagsToOrders } from "./batch/addTagsToFilteredOrders";
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
import { pauseSelectedOrders } from "./orderScope/pauseOrders";
import { resumeSelectedOrders } from "./orderScope/resumeOrders";
import { inactiveSelectedOrders } from "./orderScope/inactiveOrders";
import { inactiveFilteredOrders } from "./batch/inactiveTagsFromFilteredOrders";

const orderController = {
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
  inactiveFilteredOrders,
  addTags,
  removeTags,
  pauseTags,
  resumeTags,
  inactiveTags,
  deleteSelectedOrders,
  pauseSelectedOrders,
  resumeSelectedOrders,
  inactiveSelectedOrders,
};

export default orderController;
