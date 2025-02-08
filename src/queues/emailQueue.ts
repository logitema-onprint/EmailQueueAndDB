import Bull from "bull";
import logger from "../utils/logger";
import { queuesQueries } from "../queries/queuesQueries";

interface EmailJob {
  queueId: string;
  email: string;
  tag: string;
  payload: {
    message: string;
  };
}

export const EmailQueue = new Bull<EmailJob>("email-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

EmailQueue.process(async (job) => {
  const { queueId, email, payload } = job.data;
  const currentAttempt = job.attemptsMade + 1;
  logger.info(`Attempt ${currentAttempt}/3 for job ${job.id}`);
  const emailSent = Math.random() > 0.5;

  if (emailSent) {
    return { sent: true, queueId };
  }

  throw new Error(`Email service failed for job ${job.id}`);
});

EmailQueue.on("waiting", async (jobId) => {
  const job = await EmailQueue.getJob(jobId);
  if (job) {
    await queuesQueries.updateStatusQuery(job.data.queueId, "QUEUED");
    logger.info(`Email queued for: ${job.id}`);
  }
});

EmailQueue.on("active", async (job) => {
  await queuesQueries.updateStatusQuery(job.data.queueId, "SENDING");
  logger.info(`Starting to process job: ${job.id} for: ${job.data.email}`);
});

EmailQueue.on("completed", async (job) => {
  const successAttempt = job.attemptsMade + 1;
  await queuesQueries.updateStatusQuery(job.data.queueId, "SENT");
  logger.success(
    `Email delivered to: ${job.id} on attempt ${successAttempt}/3`
  );
});

EmailQueue.on("failed", async (job, error) => {
  const attempt = job.attemptsMade;
  const maxAttempts = job.opts.attempts || 3;

  await queuesQueries.updateStatusQuery(job.data.queueId, "FAILED");
  logger.error(
    `Email delivery failed for: ${job.id} (Attempt ${attempt}/${maxAttempts})`
  );
});
