import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { QueueService } from "../../services/queueService";
import { BatchQueue } from "../../queues/batchQueue";
import { Tag } from "@prisma/client";

export const pauseManyOrders: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const filters  = req.body;

        logger.info(req.body);

        if (!filters) {
            res.status(400).json({
                success: false,
                message: "Missing filters in request body",
            });
            return;
        }
        const totalCount = (await orderQueries.getFilteredOrders(filters)).totalCount
        const job = await BatchQueue.add(
            "pauseOrders",
            {
                type: "pauseOrders",
                filters,
            },
            {
                removeOnComplete: true,
                removeOnFail: false,
            }
        );

        res.status(202).json({
            success: true,
            totalCount,
            message: "Orders pausing started",
            jobId: job.id,
        });
    } catch (error) {
        logger.error("Failed to pause orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to pause orders",
        });
    }
};
