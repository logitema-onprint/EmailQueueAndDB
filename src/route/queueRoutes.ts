import { Router, Express } from "express";
import queueControllers from "../controllers/queueControllers";

const router = Router();

export const queueRoutes = async (server: Express) => {
  server.post("/api/queue", queueControllers.createQueue);
  server.delete("/api/queue/:jobId", queueControllers.deleteQueue);
  server.get("/api/queue/:jobId", queueControllers.getQueue);
  server.post("/api/queue/pause/:jobId", queueControllers.pauseQueue);
  server.post("/api/queue/resume/:jobId", queueControllers.resumeQueue);
  server.get("/api/queue/status/:status", queueControllers.getAllQueuesByStatus);
};

export default router;
