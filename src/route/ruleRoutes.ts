import { Router, Express } from "express";
import { ruleController } from "../controllers/rulesControllers";

const router = Router();

export const ruleRoutes = async (server: Express) => {
  server.post("/api/rule", ruleController.createRule);
  server.get("/api/rule/:ruleId", ruleController.getRule);
  server.get("/api/rules/product/:productId", ruleController.getRulesByProductId);

  server.delete("/api/rule/:ruleId", ruleController.deleteRule);
};

export default router;
