import { Worker, QueueEvents, Job } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { EmailQueue } from "../queues/emailQueue";
import { tagQueries } from "../queries/tagQueries";
import { RevalidateService } from "../services/revalidateNext";
import { log } from "console";



interface EmailJob {
  jobId: string;

  tagId: string;
  tagName: string;


}

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { jobId, tagId, tagName } = job.data;
    const currentAttempt = job.attemptsMade + 1;

    await queuesQueries.updateStatusQuery(jobId, { status: 'SENDING', processed: true });
    logger.info(`Processing attempt ${currentAttempt}/3 for tag: ${tagName}`);

    try {
      logger.success('Completed')
      await queuesQueries.updateStatusQuery(jobId, { status: 'SENT'});
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
  const { jobId, tagId, tagName } = job.data;
  logger.success('Donzo:', tagName)
  queuesQueries.getQueueCount("SENT")
  // const updateStatus = queuesQueries.updateStatusQuery(queueId, "SENT")
  // const updateJobCount = tagQueries.updateTagJobCountQuery(tagId, 'decrement')
  // const revalidateTag = RevalidateService.revalidateTag()
  // await Promise.all([updateJobCount, updateStatus])

});

worker.on("active", async (job: Job<EmailJob>) => {

  logger.info(
    `Processing tag ${job.data.tagName} for queue ${job.data.jobId}`
  );
});

worker.on("failed", async (job: Job<EmailJob> | undefined, err: Error) => {
  if (!job) {
    logger.error("Job is undefined in failed handler");
    return;
  }

  const attempt = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 3;

  // await queuesQueries.updateStatusQuery(job.data.queueId, "FAILED");
  logger.error(
    `Step ${job.data.tagName} failed for queue ${job.data.tagName} (Attempt ${attempt}/${maxAttempts})`
  );
});

queueEvents.on("added", async ({ jobId }) => {
  const job = await EmailQueue.getJob(jobId);
  // if (job) {
  //   await queuesQueries.updateStatusQuery(job.data.queueId, "QUEUED");
  // }
});

export default worker;
