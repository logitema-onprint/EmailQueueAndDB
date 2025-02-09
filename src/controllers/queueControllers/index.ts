import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";
import { pauseQueue } from "./pauseQueue";
import { resumeQueue } from "./resumeQueue";
import { getAllQueuesByStatus } from "./getAllQueuesByStatus";
import { updateQueueSendTime } from "./updateQueueSendTime";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
  pauseQueue,
  resumeQueue,
  getAllQueuesByStatus,
  updateQueueSendTime,
};

export default queueControllers;
