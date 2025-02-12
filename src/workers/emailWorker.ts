import { Worker, QueueEvents, Job } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { EmailQueue } from "../queues/emailQueue";
import { tagQueries } from "../queries/tagQueries";
import { RevalidateService } from "../services/revalidateNext";

interface Step {
  stepId: string;
  status: "pending" | "completed";
  completedAt: string | null;
}

interface EmailJob {
  queueId: string;
  email: string;
  tagId: string;
  tagName: string;
  currentStep: number;
  currentStepId: string;
  steps: Record<string, Step>;
}

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { queueId, email } = job.data;
    const currentAttempt = job.attemptsMade + 1;

    await queuesQueries.updateStatusQuery(queueId, "SENDING");
    logger.info(`Processing attempt ${currentAttempt}/3 for email: ${email}`);

    try {
      logger.success('Completed')

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

const queueEvents = new QueueEvents("email-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

worker.on("completed", async (job: Job<EmailJob>) => {
  const { queueId, tagId } = job.data;
  const updateStatus = queuesQueries.updateStatusQuery(queueId, "SENT")
  const updateJobCount = tagQueries.updateTagJobCountQuery(tagId, 'decrement')
  // const revalidateTag = RevalidateService.revalidateTag()
  await Promise.all([updateJobCount, updateStatus])

});

worker.on("active", async (job: Job<EmailJob>) => {
  logger.info(
    `Processing step ${job.data.currentStepId} for queue ${job.data.queueId}`
  );
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
    `Step ${job.data.currentStepId} failed for queue ${job.data.queueId} (Attempt ${attempt}/${maxAttempts})`
  );
});

queueEvents.on("added", async ({ jobId }) => {
  const job = await EmailQueue.getJob(jobId);
  if (job) {
    await queuesQueries.updateStatusQuery(job.data.queueId, "QUEUED");
  }
});

export default worker;
