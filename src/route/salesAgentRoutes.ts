import { Router, Express } from "express";
import { salesAgentController } from "../controllers/salesAgentControllers";

const router = Router();

export const salesAgentRoutes = async (server: Express) => {
  server.get("/api/salesagents", salesAgentController.getAllSalesAgent);
};

export default router;
