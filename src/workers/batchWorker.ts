import { Worker } from "bullmq";
import logger from "../utils/logger";
import { orderQueries } from "../queries/orderQueries";
import { BatchService } from "../services/batchService";

const orderBatchWorker = new Worker(
    "batch-operation-queue",
    async (job) => {
        const { type, filters } = job.data;

        logger.info(`Starting job ${job.id} of type ${type}`);
        logger.info(`Received filters:`, filters);

        const where = await orderQueries.getFilteredOrders(filters, undefined, undefined, true);
        logger.info(`Where object:`, where);

        const totalCount = where.totalCount ?? 0;
        logger.info(`Total count: ${totalCount}`);

        if (!where.success || !where.where) {
            throw new Error(`Failed to build where clause: ${JSON.stringify(where)}`);
        }

        try {
            switch (type) {
                case 'delete':
                    return await BatchService.deleteOrders(
                        where.where,
                        totalCount,
                        async (progress) => {
                            await job.updateProgress(progress.percent);
                        }
                    );

                default:
                    throw new Error(`Unsupported operation type: ${type}`);
            }
        } catch (error) {
            logger.error(`Batch ${type} operation failed`, error);
            throw error;
        }
    },
    {
        concurrency: 1,
        connection: {
            host: "redis",
            port: 6379,
        },
        lockDuration: 300000
    }
);

orderBatchWorker.on('error', (error) => {
    logger.error('Worker error:', error);
});

orderBatchWorker.on('completed', (job, result) => {
});

orderBatchWorker.on('failed', (job, error) => {
    logger.error(`Job ${job?.id} failed:`, error);
});

orderBatchWorker.on('active', (job) => {
    logger.info(`Job ${job.id} has started processing`);
});

orderBatchWorker.on('progress', (job, progress) => {
    logger.info(`Job ${job.id} progress: ${progress}%`);
});

export default orderBatchWorker;