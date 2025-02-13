import { Router, Express } from "express";
import queueControllers from "../controllers/queueControllers";

const router = Router();

export const queueRoutes = async (server: Express) => {
  server.post("/api/queue", queueControllers.createQueue);
  server.delete("/api/queue/:jobId", queueControllers.deleteQueue);
  server.get("/api/queue/:jobId", queueControllers.getQueue);
  server.post("/api/queue/pause", queueControllers.pauseQueuesByTag);
  server.post("/api/queue/resume", queueControllers.resumeQueuesByTag);
  server.post("/api/queue/pause/job/:jobId", queueControllers.pauseQueue);
  server.post("/api/queue/resume/job/:jobId", queueControllers.resumeQueue);
  server.get(
    "/api/queue/status/:status",
    queueControllers.getAllQueuesByStatus
  );
  server.post(
    "/api/queue/sendTime/:jobId",
    queueControllers.updateQueueSendTime
  );

  server.post("/api/queue/batch-delete", queueControllers.deleteManyQueues);
};

export default router;
