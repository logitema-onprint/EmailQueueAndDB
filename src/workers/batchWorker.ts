import { Worker } from "bullmq";
import logger from "../utils/logger";
import { orderQueries } from "../queries/orderQueries";
import { QueueService } from "../services/queueService";

const BATCH_SIZE = 100;

const orderBatchWorker = new Worker(
    "batch-operation-queue",
    async (job) => {
        const startTime = Date.now();
        const { type, filters, data } = job.data;

        logger.info(`Starting job ${job.id} of type ${type}`);
        logger.info(`Received filters:`, filters);

        const where = await orderQueries.getFilteredOrders(filters, undefined, undefined, true);
        logger.info(`Where object:`, where);

        const totalCount = where.totalCount ?? 0;
        logger.info(`Total count: ${totalCount}`);

        if (!where.success) {
            throw new Error(`Failed to build where clause ${where.success}`);
        }

        if (!where.where) {
            throw new Error('Where clause is undefined or null');
        }

        try {
            switch (type) {
                case 'delete':
                    let totalDeletedOrders = 0;
                    let allJobsIds: string[] = [];
                    const totalBatches = Math.ceil(totalCount / BATCH_SIZE);
                    logger.info(`Calculated ${totalBatches} total batches`);

                    const batchTimes: number[] = [];

                    logger.info(`Starting batch processing. Total batches: ${totalBatches}`);

                    for (let batch = 0; batch < totalBatches; batch++) {
                        logger.info(`Processing batch ${batch + 1} of ${totalBatches}`);
                        const batchStartTime = Date.now();

                        const deleteResult = await orderQueries.deleteFiltered(where.where, BATCH_SIZE);
                        logger.info(`Delete result for batch ${batch + 1}:`, deleteResult.deletedOrders);

                        if (!deleteResult) {
                            throw new Error("Delete result is undefined");
                        }

                        if (!deleteResult.success) {
                            throw new Error(deleteResult.error);
                        }

                        if (deleteResult.jobIds?.length > 0) {
                            logger.info(`Removing ${deleteResult.jobIds.length} jobs from queues`);
                            await QueueService.removeJobsFromQueues(deleteResult.jobIds);
                        }

                        totalDeletedOrders += deleteResult.deletedOrders ?? 0;
                        allJobsIds.push(...(deleteResult.jobIds ?? []));

                        const batchEndTime = Date.now();
                        const batchDuration = batchEndTime - batchStartTime;
                        batchTimes.push(batchDuration);

                        logger.success(`Batch ${batch + 1} completed. Deleted ${deleteResult.deletedOrders} orders`);
                        await job.updateProgress((batch + 1) / totalBatches * 100);
                    }

                    const totalTime = Date.now() - startTime;

                    const result = {
                        success: true,
                        totalDeletedOrders,
                        totalJobsRemoved: allJobsIds.length,
                        totalTime,
                        batchTimes,
                        averageBatchTime: batchTimes.length > 0
                            ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                            : 0
                    };

                    logger.success(`Job completed with result:`, result);
                    return result;

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

// Add more detailed event logging
orderBatchWorker.on('error', (error) => {
    logger.error('Worker error:', error);
});

orderBatchWorker.on('completed', (job, result) => {

});

orderBatchWorker.on('failed', (job, error) => {
    logger.error(`Job ${job?.id} failed:`, error);
});

// Add more worker events for debugging
orderBatchWorker.on('active', (job) => {
    logger.info(`Job ${job.id} has started processing`);
});

orderBatchWorker.on('progress', (job, progress) => {
    logger.info(`Job ${job.id} progress: ${progress}%`);
});

export default orderBatchWorker;