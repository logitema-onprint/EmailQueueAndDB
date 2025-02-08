import Queue from "bull";
import config from "../config";

export const PausedQueue = new Queue("paused-queue", {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

(async () => {
  await PausedQueue.pause();
})();

PausedQueue.process(() => {});
