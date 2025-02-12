import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";
import { pauseQueue } from "./pauseQueue";
import { resumeQueue } from "./resumeQueue";
import { getAllQueuesByStatus } from "./getAllQueuesByStatus";
import { updateQueueSendTime } from "./updateQueueSendTime";
import { deleteManyQueues } from "./deleteManyQueues";
import { pauseQueuesByTag } from "./pauseQueuesByTag";
import { resumeQueuesByTag } from "./resumeQueuesByTag";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
  pauseQueue,
  resumeQueue,
  getAllQueuesByStatus,
  updateQueueSendTime,
  deleteManyQueues,
  pauseQueuesByTag,
  resumeQueuesByTag,
};

export default queueControllers;
