import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../../queries/orderQueries";
import logger from "../../../utils/logger";
import { QueueService } from "../../../services/queueService";
import { BatchQueue } from "../../../queues/batchQueue";


export const deleteManyOrders: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const filters = req.body;

        if (!filters) {
            res.status(400).json({
                success: false,
                message: "Missing filters in request body",
            });
        }
        const totalCount = (await orderQueries.getFilteredOrders(filters)).totalCount
        const job = await BatchQueue.add('delete-orders', {
            type: 'delete',
            filters,
        }, {
            removeOnComplete: true,
            removeOnFail: false
        });

        res.status(202).json({
            success: true,
            message: "Deletion process started",
            jobId: job.id,
            filters,
            totalCount
        });

    } catch (error) {
        logger.error("Failed to queue deletion", error);
        res.status(500).json({
            success: false,
            message: "Failed to queue deletion",
        });
    }
};