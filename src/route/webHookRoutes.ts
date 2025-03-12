import { Router, Express } from "express";
import { receiveEmailWebhook } from "../controllers/outlookController";


const router = Router();

export const webhookRoutes = async (server: Express) => {

    server.post("/api/webhook/email", receiveEmailWebhook);

};

export default router;