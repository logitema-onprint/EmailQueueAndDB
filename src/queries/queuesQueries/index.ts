import { createQueue } from "./createQuery";
import { deleteQueue } from "./deleteQuery";
import { getQuery } from "./getQuery";
import { getQueueCount } from "./getQueueCount";
import { getQueuesByStatus } from "./getQueuesByStatus";
import { updateQueue } from "./updateQuery";
import { updateSendTimeQuery } from "./updateSendTimeQuery";
import { updateStatusQuery } from "./updateStatusQuery";

export const queuesQueries = {
  createQueue,
  deleteQueue,
  getQuery,
  updateStatusQuery,
  getQueuesByStatus,
  getQueueCount,
  updateSendTimeQuery,
  updateQueue,
};
