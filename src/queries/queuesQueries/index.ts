import { createQueue } from "./createQuery";
import { deleteQueue } from "./deleteQuery";
import { getQuery } from "./getQuery";
import { getQueueCount } from "./getQueueCount";
import { updateStatusQuery } from "./updateStatusQuery";
import { getAllQuery } from "./getAllQuery";
import { deleteManyJobs } from "./deleteManyQuery";
import { createQueueBulk } from "./createQueueBulk";

export const queuesQueries = {
  createQueue,
  deleteQueue,
  getQuery,
  updateStatusQuery,
  getQueueCount,
  getAllQuery,
  deleteManyJobs,
  createQueueBulk
};

