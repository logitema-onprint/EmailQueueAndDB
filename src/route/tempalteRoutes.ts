import { Router, Express } from "express";
import { templateControllers } from "../controllers/templateControllers";

const router = Router();

export const templateRoutes = async (server: Express) => {
  server.get("/api/template", templateControllers.getAllTemplates);
  server.post("/api/template/update/:id", templateControllers.updateTemplate);
  server.put("/api/template/:id", templateControllers.updateTemplateType);
  server.post("/api/template/create", templateControllers.createTemplate);
  server.get("/api/template/:id", templateControllers.getTemplate);
  server.delete("/api/template/:id", templateControllers.deleteTemplate);
};

export default router;
