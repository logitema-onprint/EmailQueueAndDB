import { Router, Express } from "express";
import queueControllers from "../controllers/queueControllers";

const router = Router();

export const queueRoutes = async (server: Express) => {
  // More specific static paths first
  server.get("/api/queue/queues", queueControllers.getAllQueues);
  server.post("/api/queue/pause", queueControllers.pauseQueuesByTag);
  server.post("/api/queue/resume", queueControllers.resumeQueuesByTag);


  // Then routes with parameters
  server.post("/api/queue/pause/job/:jobId", queueControllers.pauseQueue);
  server.post("/api/queue/resume/job/:jobId", queueControllers.resumeQueue);
  server.post(
    "/api/queue/sendTime/:jobId",
    queueControllers.updateQueueSendTime
  );

  // Most generic parameter routes last
  server.post("/api/queue", queueControllers.createQueue);
  server.delete("/api/queue/:jobId", queueControllers.deleteQueue);
  server.get("/api/queue/:jobId", queueControllers.getQueue);
};

export default router;
