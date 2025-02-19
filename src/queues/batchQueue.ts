import { Queue } from "bullmq";
import "../workers/batchWorker";

export const BatchQueue = new Queue("batch-operation-queue", {
    connection: {
        host: "redis",
        port: 6379,
    },
});
