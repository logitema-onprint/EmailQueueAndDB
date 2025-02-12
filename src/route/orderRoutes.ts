import { Router, Express } from "express";
import orderController from "../controllers/orderControllers";


const router = Router();

export const orderRoutes = async (server: Express) => {
    server.post('/api/order', orderController.createOrder)
};

export default router;
