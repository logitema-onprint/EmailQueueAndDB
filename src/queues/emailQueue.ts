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

// This is where actual email sending happens
EmailQueue.process(async (job) => {
  const { queueId, email, payload } = job.data;

  try {
    // Simulate long processing but status is already SENDING from active event
    logger.info(`Starting 20s processing delay for: ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 20000));
    logger.info(`Processing delay complete for: ${email}`);

    // Simulating email send with random success/fail
    const emailSent = Math.random() > 0.5;

    if (emailSent) {
      logger.success(`Email sent successfully to: ${email}`);
      return { sent: true, queueId };
    } else {
      throw new Error(`Email service failed to send to: ${email}`);
    }
  } catch (error) {
    logger.error(`Failed to send email to: ${email}`, error);
    throw error;
  }
});

EmailQueue.on("waiting", async (jobId) => {
  const job = await EmailQueue.getJob(jobId);
  if (job) {
    await queuesQueries.updateStatusQuery(job.data.queueId, "QUEUED");
    logger.info(`Email queued for: ${job.data.email}`);
  }
});

EmailQueue.on("active", async (job) => {
  await queuesQueries.updateStatusQuery(job.data.queueId, "SENDING");
  logger.info(`Starting to process email for: ${job.data.email}`);
});

EmailQueue.on("completed", async (job) => {
  await queuesQueries.updateStatusQuery(job.data.queueId, "SENT");
  logger.success(`Email delivered to: ${job.data.email}`);
});

EmailQueue.on("failed", async (job, error) => {
  await queuesQueries.updateStatusQuery(job.data.queueId, "FAILED");
  logger.error(`Email delivery failed for: ${job.data.email}`, {
    error: error.message,
  });
});
