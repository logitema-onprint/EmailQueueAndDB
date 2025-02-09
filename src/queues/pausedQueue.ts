import { Queue, Worker } from "bullmq";
import config from "../config";

export const PausedQueue = new Queue("paused-queue", {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

const worker = new Worker("paused-queue", async (job) => {}, {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

(async () => {
  await PausedQueue.pause();
})();

process.on("SIGTERM", async () => {
  await PausedQueue.close();
  await worker.close();
});
