import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";
import { pauseQueue } from "./pauseQueue";
import { resumeQueue } from "./resumeQueue";
import { getAllQueuesByStatus } from "./getAllQueuesByStatus";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
  pauseQueue,
  resumeQueue,
  getAllQueuesByStatus,
};

export default queueControllers;
