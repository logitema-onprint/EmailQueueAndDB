import { Router, Express } from "express";
import orderController from "../controllers/orderControllers";

const router = Router();

export const orderRoutes = async (server: Express) => {
  server.post("/api/order", orderController.createOrder);
  server.get("/api/order/:orderId", orderController.getOrder);
  server.get("/api/orders", orderController.getAllOrders);
};

export default router;
