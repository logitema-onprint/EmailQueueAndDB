import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
};

export default queueControllers;
