import { Worker, Job, ConnectionOptions } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { tagQueries } from "../queries/tagQueries";
import IORedis from "ioredis";
import { log } from "console";
import { orderQueries } from "../queries/orderQueries";
import { templateQueries } from "../queries/templateQueries";
import { openai } from "../services/openAi";

interface EmailJob {
  jobId: string;
  tagId: number;
  tagName: string;
}

const redisOptions: ConnectionOptions = {
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
  enableReadyCheck: true,
  connectTimeout: 10000,
  disconnectTimeout: 2000,
  keepAlive: 30000
};

const connection = new IORedis(redisOptions);

connection.on("error", (error) => {
  logger.error("Email worker Redis connection error:", error);
});

connection.on("connect", () => {
  logger.info("Email worker connected to Redis");
});

connection.on("reconnecting", () => {
  logger.info("Email worker Reconnecting to Redis");
});

connection.on("close", () => {
  logger.warn("Email worker Redis connection closed");
});

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { jobId, tagName } = job.data;
    const currentAttempt = job.attemptsMade + 1;

    const queue = await queuesQueries.getQuery(jobId)
    const tag = await tagQueries.getTag(job.data.tagId)

    if (queue.item?.orderId && tag.data?.templateId) {
      const order = await orderQueries.getOrder(queue.item.orderId)
      const template = await templateQueries.getTemplate(tag.data?.templateId)

      const htmlContent = await templateQueries.getHtmlContent(template.data?.htmlUrl || "")
    }

    await queuesQueries.updateStatusQuery(jobId, {
      status: "SENDING",
      processed: true,
      incrementAttempts: true,
    });
    logger.info(`Processing attempt ${currentAttempt}/3 for tag: ${tagName}`);

    try {
      logger.success("Completed");
    } catch (error) {
      throw error;
    }
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: {
      age: 604800000,
    },
  }
);

worker.on("completed", async (job: Job<EmailJob>) => {
  const { jobId, tagId } = job.data;
  const updateStatus = await queuesQueries.updateStatusQuery(jobId, {
    status: "SENT",
    completed: true,
  });

  if (!updateStatus.success) {
    logger.error(updateStatus.message, updateStatus.error, updateStatus.response)
  }

  await tagQueries.updateTagCount(tagId, "decrement");
});

worker.on("active", async (job: Job<EmailJob>) => { });

worker.on("failed", async (job: Job<EmailJob> | undefined, err: Error) => {
  if (!job) {
    logger.error("Job is undefined in failed handler");
    return;
  }

  const attempt = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 3;

  await queuesQueries.updateStatusQuery(job.data.jobId, { status: "FAILED" });

  if (attempt === 3) {
    await tagQueries.updateTagCount(job.data.tagId, "decrement");
  }

  logger.error(
    `Job ${job.data.tagName} failed for queue ${job.data.tagName} (Attempt ${attempt}/${maxAttempts})`,
    err
  );
});
export default worker;