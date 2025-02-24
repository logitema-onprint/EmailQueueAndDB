import { deleteQueue } from "./deleteQueue";
import { createQueue } from "./createQueue";
import { getQueue } from "./getQueue";
import { pauseQueue } from "./pauseQueue";
import { resumeQueue } from "./resumeQueue";
import { getAllQueues } from "./getAllQueues";
import { updateQueueSendTime } from "./updateQueueSendTime";
import { pauseQueuesByTag } from "./pauseQueuesByTag";
import { resumeQueuesByTag } from "./resumeQueuesByTag";
import { getQueueStats } from "./getQueueStats";

const queueControllers = {
  createQueue,
  deleteQueue,
  getQueue,
  pauseQueue,
  resumeQueue,
  getAllQueues,
  updateQueueSendTime,
  pauseQueuesByTag,
  resumeQueuesByTag,
  getQueueStats,
};

export default queueControllers;
