import { createQueue } from "./createQuery";
import { deleteQueue } from "./deleteQuery";
import { getQuery } from "./getQuery";
import { getQueueCount } from "./getQueueCount";
import { getQueuesByStatus } from "./getQueuesByStatus";
import { updateStatusQuery } from "./updateStatusQuery";

export const queuesQueries = {
  createQueue,
  deleteQueue,
  getQuery,
  updateStatusQuery,
  getQueuesByStatus,
  getQueueCount,
};
