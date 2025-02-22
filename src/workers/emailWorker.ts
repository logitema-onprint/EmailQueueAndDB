import { Worker, QueueEvents, Job } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { EmailQueue } from "../queues/emailQueue";
import { tagQueries } from "../queries/tagQueries";
import { RevalidateService } from "../services/revalidateNext";
import { log } from "console";
import { QueueService } from "../services/queueService";

interface EmailJob {
  jobId: string;
  tagId: number;
  tagName: string;
}

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { jobId, tagId, tagName } = job.data;
    const currentAttempt = job.attemptsMade + 1;
    const jobAttempt = await QueueService.getJobFromQueues(jobId);

    await queuesQueries.updateStatusQuery(jobId, {
      status: "SENDING",
      processed: true,
      incrementAttempts: true,
    });
    logger.info(`Processing attempt ${currentAttempt}/3 for tag: ${tagName}`);

    try {
      const shouldFail = Math.random() < 0.5;

      if (shouldFail) {
        throw new Error(`Artificial failure for tag: ${tagName}`);
      }
      logger.success("Completed");
    } catch (error) {
      throw error;
    }
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
    concurrency: 3,
  }
);

worker.on("completed", async (job: Job<EmailJob>) => {
  const { jobId, tagId } = job.data;
  const updateStatus = queuesQueries.updateStatusQuery(jobId, {
    status: "SENT",
    completed: true,
  });

  await tagQueries.updateTagCount(tagId, "decrement");

  await Promise.all([updateStatus]);
});

worker.on("active", async (job: Job<EmailJob>) => {});

worker.on("failed", async (job: Job<EmailJob> | undefined, err: Error) => {
  if (!job) {
    logger.error("Job is undefined in failed handler");
    return;
  }

  const attempt = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 3;

  await queuesQueries.updateStatusQuery(job.data.jobId, { status: "FAILED" });
  await tagQueries.updateTagCount(job.data.tagId, "decrement");
  logger.error(
    `Job ${job.data.tagName} failed for queue ${job.data.tagName} (Attempt ${attempt}/${maxAttempts})`
  );
});

export default worker;
