import {
  BatchCommonState,
  BatchMetrics,
  BatchProgress,
} from "../types/batchTypes";
import logger from "./logger";
import { orderQueries } from "../queries/orderQueries";
import { FilteredOrders } from "../types/orderApi";

export function initializeBatchProcess(
  totalCount: number,
  batchSize: number
): BatchCommonState {
  return {
    startTime: Date.now(),
    batchTimes: [],
    totalProcessedOrders: 0,
    lastProcessedId: 0,
    failedOrders: [],
    totalBatches: Math.ceil(totalCount / batchSize),
  };
}

export async function processOrderBatch(
  where: FilteredOrders["filters"],
  lastProcessedId: number,
  batchSize: number,
  batchNumber: number,
  totalBatches: number
) {
  logger.info(`Processing batch ${batchNumber} of ${totalBatches}`);
  const ordersResult = await orderQueries.getOrderIds(
    where,
    batchSize,
    lastProcessedId
  );

  logger.info(`Batch ${batchNumber} query result:`, {
    success: ordersResult.success,
    orderIdsLength: ordersResult.orderIds?.length,
    firstFewIds: ordersResult.orderIds?.slice(0, 5),
    batchSize,
  });

  if (!ordersResult.success || !ordersResult.orderIds?.length) {
    logger.warn(`No orders found in batch ${batchNumber}`);
    return null;
  }

  return ordersResult;
}

export function calculateBatchMetrics(
  batchTimes: number[],
  startTime: number
): BatchMetrics {
  return {
    totalTime: Date.now() - startTime,
    batchTimes,
    averageBatchTime:
      batchTimes.length > 0
        ? batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length
        : 0,
  };
}

export async function updateProgress(
  onProgress: ((progress: BatchProgress) => Promise<void>) | undefined,
  current: number,
  total: number,
  batch: number,
  totalBatches: number
) {
  if (onProgress) {
    await onProgress({
      current,
      total,
      percent: ((batch + 1) / totalBatches) * 100,
    });
  }
}

export function recordBatchTime(
  batchTimes: number[],
  batchStartTime: number
): number {
  const batchDuration = Date.now() - batchStartTime;
  batchTimes.push(batchDuration);
  return batchDuration;
}
