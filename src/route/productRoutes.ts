import { Router, Express } from "express";
import { salesAgentController } from "../controllers/salesAgentControllers";
import { productController } from "../controllers/productControllers";

const router = Router();

export const productRoutes = async (server: Express) => {
  server.get("/api/products", productController.getAllProducts);
};

export default router;
