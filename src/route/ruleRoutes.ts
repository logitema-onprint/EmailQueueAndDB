import { Router, Express } from "express";
import { ruleController } from "../controllers/rulesControllers";

const router = Router();

export const ruleRoutes = async (server: Express) => {
  server.post("/api/rule", ruleController.createRule);
  server.get("/api/rule/:ruleId", ruleController.getRule);
  server.get("/api/rules", ruleController.getRules);
  server.delete("/api/rule/:ruleId", ruleController.deleteRule);
  server.patch('/api/rule/:ruleId', ruleController.updateRule)
};

export default router;
