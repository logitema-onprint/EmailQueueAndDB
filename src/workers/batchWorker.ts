import { Worker } from "bullmq";
import logger from "../utils/logger";
import { orderQueries } from "../queries/orderQueries";
import { tagQueries } from "../queries/tagQueries";
import { BatchServiceOrderScope } from "../services/batchServiceOrderScope";

const orderBatchWorker = new Worker(
  "batch-operation-queue",
  async (job) => {
    const { type, filters, tagIds } = job.data;

    logger.info(`Starting job ${job.id} of type ${type}`);
    logger.info(`Received filters:`, filters);

    const where = await orderQueries.getFilteredOrders(
      filters,
      undefined,
      undefined,
      true
    );
    logger.info(`Where object:`, where);

    const totalCount = where.totalCount ?? 0;
    logger.info(`Total count: ${totalCount}`);

    if (!where.success || !where.where) {
      throw new Error(`Failed to build where clause: ${JSON.stringify(where)}`);
    }

    try {
      switch (type) {
        case "delete":
          return await BatchServiceOrderScope.deleteOrders(
            where.where,
            totalCount,
            async (progress) => {
              await job.updateProgress(progress.percent);
            }
          );
        case "add-tags":
          if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
            throw new Error("Missing or invalid tags for add-tags operation");
          }

          const tagPromises = tagIds.map((tagId) => tagQueries.getTag(tagId));
          const tagResults = await Promise.all(tagPromises);

          const validTags = [];

          for (const result of tagResults) {
            if (result.success && result.data) {
              validTags.push(result.data);
            }
          }

          logger.info(validTags);

          return await BatchServiceOrderScope.addTagsToOrders(
            where.where,
            totalCount,
            validTags,
            async (progress) => {
              await job.updateProgress(progress.percent);
            }
          );
        case "pauseOrders":
          return await BatchServiceOrderScope.pauseOrderJobs(
            where.where,
            totalCount,
            async (progress) => {
              await job.updateProgress(progress.percent);
            }
          );

        case "resumeOrders":
          return await BatchServiceOrderScope.resumeOrderJobs(
            where.where,
            totalCount,
            async (progress) => {
              await job.updateProgress(progress.percent);
            }
          );
        case "inactiveOrders":
          return await BatchServiceOrderScope.makeInactiveOrderJobs(
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
    lockDuration: 300000,
  }
);

orderBatchWorker.on("error", (error) => {
  logger.error("Worker error:", error);
});

orderBatchWorker.on("completed", (job, result) => {});

orderBatchWorker.on("failed", (job, error) => {
  logger.error(`Job ${job?.id} failed:`, error);
});

orderBatchWorker.on("active", (job) => {
  logger.info(`Job ${job.id} has started processing`);
});

orderBatchWorker.on("progress", (job, progress) => {
  logger.info(`Job ${job.id} progress: ${progress}%`);
});

export default orderBatchWorker;
