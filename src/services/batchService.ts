import { QueueService } from "./queueService";
import { orderQueries } from "../queries/orderQueries";
import logger from "../utils/logger";

interface BatchResult {
    success: boolean;
    totalDeletedOrders: number;
    totalJobsRemoved: number;
    totalTime: number;
    batchTimes: number[];
    averageBatchTime: number;
}

interface BatchProgress {
    current: number;
    total: number;
    percent: number;
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

            const deleteResult = await orderQueries.deleteFiltered(where, this.BATCH_SIZE);
            logger.info(`Delete result for batch ${batch + 1}:`, deleteResult?.deletedOrders);

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

            logger.success(`Batch ${batch + 1} completed. Deleted ${deleteResult.deletedOrders} orders`);

            if (onProgress) {
                await onProgress({
                    current: totalDeletedOrders,
                    total: totalCount,
                    percent: ((batch + 1) / totalBatches) * 100
                });
            }
        }

        const result: BatchResult = {
            success: true,
            totalDeletedOrders,
            totalJobsRemoved: allJobsIds.length,
            totalTime: Date.now() - startTime,
            batchTimes,
            averageBatchTime: batchTimes.length > 0
                ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
                : 0
        };

        logger.success(`Batch deletion completed:`, result);
        return result;
    }
}