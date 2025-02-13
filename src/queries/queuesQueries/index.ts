import { createQueue } from "./createQuery";
import { deleteManyQuery } from "./batch/deleteManyQuery";
import { deleteQueue } from "./deleteQuery";
import { getQuery } from "./getQuery";
import { getQueueCount } from "./getQueueCount";
import { getQueuesByStatus } from "./getQueuesByStatus";
import { updateQueue } from "./updateQuery";
import { updateSendTimeQuery } from "./updateSendTimeQuery";
import { updateStatusQuery } from "./updateStatusQuery";
import { getQueuesByTag } from "./getQueuesBytTag";
import { getByStatusAndTag } from "./getByStatusAndTag";

export const queuesQueries = {
  createQueue,
  deleteQueue,
  getQuery,
  updateStatusQuery,
  getQueuesByStatus,
  getQueueCount,
  updateSendTimeQuery,
  updateQueue,
  deleteManyQuery,
  getQueuesByTag,
  getByStatusAndTag,
};
