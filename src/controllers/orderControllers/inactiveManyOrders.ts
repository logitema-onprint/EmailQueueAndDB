import { RequestHandler, Response, Request } from "express";
import logger from "../../utils/logger";
import { BatchQueue } from "../../queues/batchQueue";


export const inactiveManyOrders: RequestHandler = async (
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

        const job = await BatchQueue.add(
            "inactiveOrders",
            {
                type: "inactiveOrders",
                filters,
            },
            {
                removeOnComplete: true,
                removeOnFail: false,
            }
        );

        res.status(202).json({
            success: true,
            message: "Orders inactive started",
            jobId: job.id,
        });
    } catch (error) {
        logger.error("Failed to inactive orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to inactive orders",
        });
    }
};
