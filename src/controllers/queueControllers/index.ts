import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";
import { pauseQueue } from "./pauseQueue";
import { resumeQueue } from "./resumeQueue";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
  pauseQueue,
  resumeQueue,
};

export default queueControllers;
