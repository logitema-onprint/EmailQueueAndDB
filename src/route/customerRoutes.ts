import { Router, Express } from "express";
import { custumerControllers } from "../controllers/custumerControllers";

const router = Router();

export const customerRoutes = async (server: Express) => {
  server.get("/api/customer/:email", custumerControllers.getCustumerInfo);
};

export default router;
