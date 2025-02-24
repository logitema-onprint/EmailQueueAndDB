import { QueueService } from "./queueService";
import { orderQueries } from "../queries/orderQueries";
import logger from "../utils/logger";
import { FilteredOrders } from "../types/orderApi";
import {
  BatchResult,
  BatchTagResult,
  BatchPauseResumeResult,
  BatchProgress,
  Tags,
} from "../types/batchTypes";
import {
  initializeBatchProcess,
  processOrderBatch,
  calculateBatchMetrics,
  updateProgress,
  recordBatchTime,
} from "../utils/batchUtils";

export class BatchServiceOrderScope {
  private static readonly BATCH_SIZE = 100;

  static async deleteOrders(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalDeletedOrders = 0;
    let allJobsIds: string[] = [];

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();
      logger.info(`Processing batch ${batch + 1} of ${common.totalBatches}`);

      const deleteResult = await orderQueries.deleteFiltered(
        where,
        this.BATCH_SIZE
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

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Deleted ${
          deleteResult.deletedOrders
        } orders`
      );

      await updateProgress(
        onProgress,
        totalDeletedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchResult = {
      success: true,
      totalDeletedOrders,
      totalJobsRemoved: allJobsIds.length,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch deletion completed:`, result);
    return result;
  }

  static async addTagsToOrders(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    tags: Tags[],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchTagResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsCreated = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const queueResult = await QueueService.createQueues(
        ordersResult.orderIds,
        tags
      );
      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsCreated += queueResult.data?.length ?? 0;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Processed ${
          ordersResult.orderIds.length
        } orders`
      );

      await updateProgress(
        onProgress,
        common.totalProcessedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchTagResult = {
      success: common.failedOrders.length === 0,
      totalProcessedOrders: common.totalProcessedOrders,
      totalJobsCreated,
      failedOrders: common.failedOrders,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch tag addition completed:`, result);
    return result;
  }

  static async pauseOrderJobs(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchPauseResumeResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsPaused = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      logger.success('Fired')
      const batchStartTime = Date.now();

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      logger.info(ordersResult?.success)

      if (!ordersResult) break;

      const pauseResult = await QueueService.pauseOrders(ordersResult.orderIds);
      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsFound += pauseResult.totalJobsFound;
      totalJobsProcessed += pauseResult.totalJobsProcessed;
      totalJobsPaused += pauseResult.totalJobsPaused;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Paused ${
          pauseResult.successCount
        } orders`
      );

      await updateProgress(
        onProgress,
        common.totalProcessedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchPauseResumeResult = {
      success: common.failedOrders.length === 0,
      totalProcessedOrders: common.totalProcessedOrders,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsPaused,
      failedOrders: common.failedOrders,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch pause completed:`, result);
    return result;
  }

  static async resumeOrderJobs(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchPauseResumeResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsResumed = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const resumeResult = await QueueService.resumeOrders(
        ordersResult.orderIds
      );
      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsFound += resumeResult.totalJobsFound;
      totalJobsProcessed += resumeResult.totalJobsProcessed;
      totalJobsResumed += resumeResult.totalJobsResumed;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Resumed ${
          resumeResult.successCount
        } orders`
      );

      await updateProgress(
        onProgress,
        common.totalProcessedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchPauseResumeResult = {
      success: common.failedOrders.length === 0,
      totalProcessedOrders: common.totalProcessedOrders,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsResumed,
      failedOrders: common.failedOrders,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch resume completed:`, result);
    return result;
  }

  static async makeInactiveOrderJobs(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchPauseResumeResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsResumed = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const inactiveResult = await QueueService.makeInactiveOrders(
        ordersResult.orderIds
      );
      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsFound += inactiveResult.totalJobsFound;
      totalJobsProcessed += inactiveResult.totalJobsProcessed;
      totalJobsResumed += inactiveResult.totalJobsRemoved;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Made inactive ${
          inactiveResult.successCount
        } orders`
      );

      await updateProgress(
        onProgress,
        common.totalProcessedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchPauseResumeResult = {
      success: common.failedOrders.length === 0,
      totalProcessedOrders: common.totalProcessedOrders,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsResumed,
      failedOrders: common.failedOrders,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch inactive completed:`, result);
    return result;
  }
}
