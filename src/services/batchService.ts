import { QueueService } from "./queueService";
import { orderQueries } from "../queries/orderQueries";
import logger from "../utils/logger";
import { FilteredOrders } from "../types/orderApi";


interface BatchResult {
    success: boolean;
    totalDeletedOrders: number;
    totalJobsRemoved: number;
    totalTime: number;
    batchTimes: number[];
    averageBatchTime: number;
}
interface BatchPauseResumeResult extends BatchTagResult {
    totalJobsFound: number;
    totalJobsProcessed: number;
    totalJobsPaused?: number;
    totalJobsResumed?: number;
}

interface BatchTagResult {
    success: boolean;
    totalProcessedOrders: number;
    totalJobsCreated?: number;
    totalTime: number;
    batchTimes: number[];
    averageBatchTime: number;
    failedOrders: Array<{ orderId: number; error: string }>;

}

interface BatchProgress {
    current: number;
    total: number;
    percent: number;
}

interface Tags {
    id: number;
    tagName: string;
    scheduledFor: bigint;
}

export class BatchService {
    private static readonly BATCH_SIZE = 100;

    static async deleteOrders(
        where: any,
        totalCount: number,
        onProgress?: (progress: BatchProgress) => Promise<void>
    ): Promise<BatchResult> {
        const startTime = Date.now();
        let totalDeletedOrders = 0;
        let allJobsIds: string[] = [];
        const totalBatches = Math.ceil(totalCount / this.BATCH_SIZE);
        const batchTimes: number[] = [];

        logger.info(`Starting batch deletion. Total batches: ${totalBatches}`);

        for (let batch = 0; batch < totalBatches; batch++) {
            logger.info(`Processing batch ${batch + 1} of ${totalBatches}`);
            const batchStartTime = Date.now();

            const deleteResult = await orderQueries.deleteFiltered(
                where,
                this.BATCH_SIZE
            );
            logger.info(
                `Delete result for batch ${batch + 1}:`,
                deleteResult?.deletedOrders
            );

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

            const batchDuration = Date.now() - batchStartTime;
            batchTimes.push(batchDuration);

            logger.success(
                `Batch ${batch + 1} completed. Deleted ${deleteResult.deletedOrders
                } orders`
            );

            if (onProgress) {
                await onProgress({
                    current: totalDeletedOrders,
                    total: totalCount,
                    percent: ((batch + 1) / totalBatches) * 100,
                });
            }
        }

        const result: BatchResult = {
            success: true,
            totalDeletedOrders,
            totalJobsRemoved: allJobsIds.length,
            totalTime: Date.now() - startTime,
            batchTimes,
            averageBatchTime:
                batchTimes.length > 0
                    ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                    : 0,
        };

        logger.success(`Batch deletion completed:`, result);
        return result;
    }
    static async addTagsToOrders(
        where: FilteredOrders['filters'],
        totalCount: number,
        tags: Tags[],
        onProgress?: (progress: BatchProgress) => Promise<void>
    ): Promise<BatchTagResult> {
        const startTime = Date.now();
        let totalProcessedOrders = 0;
        let totalJobsCreated = 0;
        const failedOrders: { orderId: number; error: string }[] = [];
        const totalBatches = Math.ceil(totalCount / this.BATCH_SIZE);
        const batchTimes: number[] = [];

        logger.info(`Starting batch tag addition. Total batches: ${totalBatches}`);
        let lastProcessedId = 0;
        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStartTime = Date.now();
            logger.info(`Processing batch ${batch + 1} of ${totalBatches}`);
            const ordersResult = await orderQueries.getOrderIds(
                where,
                this.BATCH_SIZE,
                lastProcessedId
            );

            logger.info(`Batch ${batch + 1} query result:`, {
                success: ordersResult.success,
                orderIdsLength: ordersResult.orderIds?.length,
                firstFewIds: ordersResult.orderIds?.slice(0, 5),
                batchSize: this.BATCH_SIZE,

            });


            if (!ordersResult.success || !ordersResult.orderIds?.length) {
                logger.warn(`No orders found in batch ${batch + 1}`);
                break;
            }
            const queueResult = await QueueService.createQueues(ordersResult.orderIds, tags);
            totalProcessedOrders += ordersResult.orderIds.length;
            totalJobsCreated += queueResult.data?.length ?? 0;
            lastProcessedId = ordersResult.orderIds[ordersResult.orderIds.length - 1];

            const batchDuration = Date.now() - batchStartTime;
            batchTimes.push(batchDuration);

            logger.success(
                `Batch ${batch + 1} completed. Processed ${ordersResult.orderIds.length} orders`
            );

            if (onProgress) {
                await onProgress({
                    current: totalProcessedOrders,
                    total: totalCount,
                    percent: ((batch + 1) / totalBatches) * 100,
                });
            }
        }

        const result: BatchTagResult = {
            success: failedOrders.length === 0,
            totalProcessedOrders,
            totalJobsCreated,
            failedOrders,
            totalTime: Date.now() - startTime,
            batchTimes,
            averageBatchTime:
                batchTimes.length > 0
                    ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                    : 0,
        };

        logger.success(`Batch tag addition completed:`, result);
        return result;
    }
    static async pauseOrderJobs(
        where: FilteredOrders['filters'],
        totalCount: number,
        onProgress?: (progress: BatchProgress) => Promise<void>
    ): Promise<BatchTagResult> {
        const startTime = Date.now();


        const totalBatches = Math.ceil(totalCount / this.BATCH_SIZE);
        const batchTimes: number[] = [];

        let totalProcessedOrders = 0;
        let totalJobsFound = 0;
        let totalJobsProcessed = 0;
        let totalJobsPaused = 0;
        const failedOrders: { orderId: number; error: string }[] = [];

        const uniqueOrderIds = new Set<number>();

        logger.info(`Starting batch pause jobs. Total batches: ${totalBatches}`);
        let lastProcessedId = 0;
        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStartTime = Date.now();
            logger.info(`Processing batch ${batch + 1} of ${totalBatches}`);

            const ordersResult = await orderQueries.getOrderIds(
                where,
                this.BATCH_SIZE,
                lastProcessedId
            );
            logger.info(`Batch ${batch + 1} received orders:`, ordersResult.orderIds?.length);
            logger.info(`Batch ${batch + 1} query result:`, {
                success: ordersResult.success,
                orderIdsLength: ordersResult.orderIds?.length,
                firstFewIds: ordersResult.orderIds?.slice(0, 5),  // Log first 5 IDs for debugging
                batchSize: this.BATCH_SIZE
            });

            if (!ordersResult.success || !ordersResult.orderIds?.length) {
                logger.warn(`No orders found in batch ${batch + 1}`);
                break;
            }
            lastProcessedId = ordersResult.orderIds[ordersResult.orderIds.length - 1];

            const pauseResult = await QueueService.pauseOrders(ordersResult.orderIds);
            totalProcessedOrders += ordersResult.orderIds.length;
            totalJobsFound += pauseResult.totalJobsFound;
            totalJobsProcessed += pauseResult.totalJobsProcessed;
            totalJobsPaused += pauseResult.totalJobsPaused;



            const batchDuration = Date.now() - batchStartTime;
            batchTimes.push(batchDuration);

            logger.success(
                `Batch ${batch + 1} completed. Paused ${pauseResult.successCount} orders`
            );
            logger.info(`Total unique orders processed: ${uniqueOrderIds.size}`);

            if (onProgress) {
                await onProgress({
                    current: totalProcessedOrders,
                    total: totalCount,
                    percent: ((batch + 1) / totalBatches) * 100,
                });
            }
        }

        const result: BatchPauseResumeResult = {
            success: failedOrders.length === 0,
            totalProcessedOrders,
            totalJobsFound,
            totalJobsProcessed,
            totalJobsPaused,
            failedOrders,
            totalTime: Date.now() - startTime,
            batchTimes,
            averageBatchTime:
                batchTimes.length > 0
                    ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                    : 0,
        };

        logger.success(`Batch pause completed:`, result);
        return result;
    }
    static async resumeOrderJobs(
        where: FilteredOrders['filters'],
        totalCount: number,
        onProgress?: (progress: BatchProgress) => Promise<void>
    ): Promise<BatchTagResult> {

        const startTime = Date.now();
        let totalProcessedOrders = 0;
        let totalJobsFound = 0;
        let totalJobsProcessed = 0;
        let totalJobsResumed = 0;
        const failedOrders: { orderId: number; error: string }[] = [];
        const totalBatches = Math.ceil(totalCount / this.BATCH_SIZE);
        const batchTimes: number[] = [];
        const uniqueOrderIds = new Set<number>();
        logger.info(`Starting batch resume jobs. Total batches: ${totalBatches}`);
        let lastProcessedId = 0;
        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStartTime = Date.now();
            logger.info(`Processing batch ${batch + 1} of ${totalBatches}`);
            const ordersResult = await orderQueries.getOrderIds(
                where,
                this.BATCH_SIZE,
                lastProcessedId
            );

            logger.info(`Batch ${batch + 1} query result:`, {
                success: ordersResult.success,
                orderIdsLength: ordersResult.orderIds?.length,
                firstFewIds: ordersResult.orderIds?.slice(0, 5),  // Log first 5 IDs for debugging
                batchSize: this.BATCH_SIZE
            });

            if (!ordersResult.success || !ordersResult.orderIds?.length) {
                logger.warn(`No orders found in batch ${batch + 1}`);
                break;
            }
            lastProcessedId = ordersResult.orderIds[ordersResult.orderIds.length - 1];


            const resumeResult = await QueueService.resumeOrders(ordersResult.orderIds);
            totalJobsFound += resumeResult.totalJobsFound;
            totalJobsProcessed += resumeResult.totalJobsProcessed;
            totalJobsResumed += resumeResult.totalJobsResumed;
            totalProcessedOrders += resumeResult.successCount;


            logger.success(
                `Batch ${batch + 1} completed. Resumed ${resumeResult.successCount} orders`
            );
            const batchDuration = Date.now() - batchStartTime;
            batchTimes.push(batchDuration);

            if (onProgress) {
                await onProgress({
                    current: totalProcessedOrders,
                    total: totalCount,
                    percent: ((batch + 1) / totalBatches) * 100,
                });
            }
        }
        logger.info(`Total unique orders processed: ${uniqueOrderIds.size}`);
        const result: BatchPauseResumeResult = {
            success: failedOrders.length === 0,
            totalProcessedOrders,
            totalJobsFound,
            totalJobsProcessed,
            totalJobsResumed,
            failedOrders,
            totalTime: Date.now() - startTime,
            batchTimes,
            averageBatchTime:
                batchTimes.length > 0
                    ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                    : 0,
        };
        logger.success(`Batch resume completed:`, result);
        return result;
    }
}