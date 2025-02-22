import { Tag } from "@prisma/client";
import { orderQueries } from "../queries/orderQueries";
import { BatchPauseResumeResult, BatchProgress, BatchResult, Tags } from "../types/batchTypes";
import { FilteredOrders } from "../types/orderApi";
import {
  initializeBatchProcess,
  recordBatchTime,
  updateProgress,
  calculateBatchMetrics,
  processOrderBatch,
} from "../utils/batchUtils";
import logger from "../utils/logger";
import { QueueService } from "./queueService";

export class BatchServiceOrderTagScope {
  private static readonly BATCH_SIZE = 100;

  static async removeSelectedTags(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    tagIds: number[],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsRemoved = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();
      logger.info(`Processing batch ${batch + 1} of ${common.totalBatches}`);

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const removeResult = await QueueService.removeTagsFromOrders(
        ordersResult.orderIds,
        tagIds
      );

      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsFound += removeResult.totalJobsFound;
      totalJobsProcessed += removeResult.totalJobsProcessed;
      totalJobsRemoved += removeResult.totalJobsRemoved;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Removed ${
          removeResult.successCount
        } jobs`
      );

      await updateProgress(
        onProgress,
        common.totalProcessedOrders,
        totalCount,
        batch,
        common.totalBatches
      );
    }

    const result: BatchResult = {
      success: common.failedOrders.length === 0,
      totalProcessedOrders: common.totalProcessedOrders,
      totalJobsFound,
      totalJobsProcessed,
      totalJobsRemoved,
      failedOrders: common.failedOrders,
      ...calculateBatchMetrics(common.batchTimes, common.startTime),
    };

    logger.success(`Batch tag removal completed:`, result);
    return result;
  }
  static async pauseSelectedTags(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    tagIds: number[],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchPauseResumeResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsPaused = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();
      logger.info(`Processing batch ${batch + 1} of ${common.totalBatches}`);

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const pauseResult = await QueueService.pauseOrders(
        ordersResult.orderIds,
        tagIds
      );

      common.totalProcessedOrders += ordersResult.orderIds.length;
      totalJobsFound += pauseResult.totalJobsFound;
      totalJobsProcessed += pauseResult.totalJobsProcessed;
      totalJobsPaused += pauseResult.totalJobsPaused;
      common.lastProcessedId =
        ordersResult.orderIds[ordersResult.orderIds.length - 1];

      recordBatchTime(common.batchTimes, batchStartTime);

      logger.success(
        `Batch ${batch + 1} completed. Paused ${pauseResult.successCount} jobs`
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

    logger.success(`Batch tag pause completed:`, result);
    return result;
  }

  static async resumeSelectedTags(
    where: FilteredOrders["filters"],
    totalCount: FilteredOrders["pageSize"],
    tagIds: number[],
    onProgress?: (progress: BatchProgress) => Promise<void>
  ): Promise<BatchPauseResumeResult> {
    const common = initializeBatchProcess(totalCount, this.BATCH_SIZE);
    let totalJobsFound = 0;
    let totalJobsProcessed = 0;
    let totalJobsResumed = 0;

    for (let batch = 0; batch < common.totalBatches; batch++) {
      const batchStartTime = Date.now();
      logger.info(`Processing batch ${batch + 1} of ${common.totalBatches}`);

      const ordersResult = await processOrderBatch(
        where,
        common.lastProcessedId,
        this.BATCH_SIZE,
        batch + 1,
        common.totalBatches
      );

      if (!ordersResult) break;

      const resumeResult = await QueueService.resumeOrders(
        ordersResult.orderIds,
        tagIds
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
        } jobs`
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

    logger.success(`Batch tag resume completed:`, result);
    return result;
  }
}
