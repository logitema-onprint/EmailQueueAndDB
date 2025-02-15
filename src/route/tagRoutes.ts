import { Router, Express } from "express";
import { tagController } from "../controllers/tagControllers";

const router = Router();

export const tagRoutes = async (server: Express) => {
  server.post("/api/tag", tagController.createTag);
  server.get("/api/tag/:tagId", tagController.getTag);
  server.get("/api/tags", tagController.getAllTags);

  server.delete("/api/tag/:tagId", tagController.deleteTag);
  server.patch("/api/tag/:tagId", tagController.updateTag);
  server.patch("/api/tag/:tagId/status", tagController.updateTagStatus);
};

export default router;
