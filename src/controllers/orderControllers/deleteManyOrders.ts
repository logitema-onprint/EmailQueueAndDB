import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { QueueService } from "../../services/queueService";


export const deleteManyOrders: RequestHandler = async (
    req: Request,
    res: Response
) => {
    const startTime = Date.now();
    try {
        const filters = req.body;

        if (!filters) {
            res.status(400).json({
                success: false,
                message: "Missing filters in request body",
            });
            return
        }

        const result = await orderQueries.deleteFiltered(filters);

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error
            });
            return
        }


        if (result?.jobIds?.length > 0) {
            await Promise.all(
                result.jobIds.map(jobId => QueueService.removeJobsFromQueues([jobId]))
            );
        }


        logger.info(`Deleted ${result.deletedOrders} orders and ${result.jobIds.length} jobs`);

        const endTime = Date.now();
        const duration = endTime - startTime;
        if (result.deletedOrders)

            res.status(200).json({
                success: true,
                message: `Successfully deleted ${result.deletedOrders} orders and ${result.jobIds.length} jobs`,
                count: result.deletedOrders,
                totalTime: `${duration}ms`,
                averageTimePerOrder: result?.deletedOrders > 0
                    ? `${duration / result?.deletedOrders}ms`
                    : '0ms'
            });

    } catch (error) {
        logger.error("Failed to delete orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete orders",
        });
    }
};