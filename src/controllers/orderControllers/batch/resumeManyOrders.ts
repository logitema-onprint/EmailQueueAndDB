import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../../queries/orderQueries";
import logger from "../../../utils/logger";
import { QueueService } from "../../../services/queueService";
import { BatchQueue } from "../../../queues/batchQueue";
import { Tag } from "@prisma/client";

export const resumeManyOrders: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const  filters  = req.body;

        logger.info(req.body);

        if (!filters) {
            res.status(400).json({
                success: false,
                message: "Missing filters in request body",
            });
            return;
        }

        const job = await BatchQueue.add(
            "resumeOrders",
            {
                type: "resumeOrders",
                filters,
            },
            {
                removeOnComplete: true,
                removeOnFail: false,
            }
        );

        res.status(202).json({
            success: true,
            message: "Resume orders process started",
            jobId: job.id,
        });
    } catch (error) {
        logger.error("Failed to resume orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to resume orders",
        });
    }
};
