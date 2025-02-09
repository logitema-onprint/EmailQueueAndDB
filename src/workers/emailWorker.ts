import { Worker, QueueEvents, Job } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { EmailQueue } from "../queues/emailQueue";

interface EmailJob {
  queueId: string;
  email: string;
  tag: string;
  payload: {
    message: string;
  };
}

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { queueId, email, payload } = job.data;
    const currentAttempt = job.attemptsMade + 1;
    await queuesQueries.updateStatusQuery(job.data.queueId, "SENDING");
    logger.info(`Processing attempt ${currentAttempt}/3 for email: ${email}`);

    const emailSent = Math.random() > 0.9;

    if (emailSent) {
      return { sent: true, queueId };
    }

    throw new Error(`Failed to send email on attempt ${currentAttempt}`);
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
    concurrency: 3,
  }
);

const queueEvents = new QueueEvents("email-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

// Event handlers
worker.on("completed", async (job: Job<EmailJob>) => {
  const successAttempt = job.attemptsMade;
  await queuesQueries.updateStatusQuery(job.data.queueId, "SENT");
  logger.success(
    `Email delivered to: ${job.id} on attempt ${successAttempt}/3`
  );
});

worker.on("active", async (job: Job<EmailJob>) => {
  logger.info(`Starting to process job: ${job.id} for: ${job.data.email}`);
});

worker.on("failed", async (job: Job<EmailJob> | undefined, err: Error) => {
  if (!job) {
    logger.error("Job is undefined in failed handler");
    return;
  }

  const attempt = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 3;

  await queuesQueries.updateStatusQuery(job.data.queueId, "FAILED");
  logger.error(
    `Email delivery failed for: ${job.id} (Attempt ${attempt}/${maxAttempts})`
  );
});

// Queue events
queueEvents.on("added", async ({ jobId }) => {
  const job = await EmailQueue.getJob(jobId);
  if (job) {
    await queuesQueries.updateStatusQuery(job.data.queueId, "QUEUED");
    logger.info(`Email queued for: ${jobId}`);
  }
});

export default worker;
