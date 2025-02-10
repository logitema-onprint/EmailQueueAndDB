import { Worker, QueueEvents, Job } from "bullmq";
import { queuesQueries } from "../queries/queuesQueries";
import logger from "../utils/logger";
import { EmailQueue } from "../queues/emailQueue";
import { stepQueries } from "../queries/stepQueries";

interface Step {
  stepId: string;
  status: "pending" | "completed";
  completedAt: string | null;
}

interface EmailJob {
  queueId: string;
  email: string;
  tag: string;
  currentStep: number;
  currentStepId: string;
  steps: Record<string, Step>;
}

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    const { queueId, email, currentStepId } = job.data;
    const currentAttempt = job.attemptsMade + 1;

    await queuesQueries.updateStatusQuery(queueId, "SENDING");
    logger.info(`Processing attempt ${currentAttempt}/3 for email: ${email}`);

    try {
      // Your email sending logic here
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
  const { queueId, currentStep, steps } = job.data;
  console.log("Current job data:", { queueId, currentStep, steps });

  try {
    const stepKeys = Object.keys(steps);
    const currentKey = stepKeys[currentStep];
    console.log("Current step info:", { currentKey, currentStep });

    const updatedSteps = { ...steps };
    updatedSteps[currentKey] = {
      ...steps[currentKey],
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    console.log("Steps after update:", updatedSteps);

    const nextStep = currentStep + 1;
    const nextKey = stepKeys[nextStep];

    if (nextKey) {
      console.log("Moving to next step:", { nextStep, nextKey });

      const nextStepConfig = await stepQueries.getStepQuery(
        steps[nextKey].stepId
      );
      console.log("Next step config:", nextStepConfig);

      await EmailQueue.remove(queueId);

      // Create new job
      await EmailQueue.add(
        "email-job",
        {
          ...job.data,
          currentStep: nextStep,
          currentStepId: steps[nextKey].stepId,
          steps: updatedSteps,
        },
        {
          delay: nextStepConfig?.item?.waitDuration,
          attempts: 3,
          jobId: queueId,
        }
      );

      await queuesQueries.updateQueue(queueId, {
        steps: updatedSteps,
        currentStepId: steps[nextKey].stepId,
        currentStep: nextStep,
        status: "QUEUED",
      });
    } else {
      logger.success("All steps completed");
      await queuesQueries.updateQueue(queueId, {
        steps: updatedSteps,
        status: "COMPLETED",
      });
    }
  } catch (error) {
    console.error("Error in completed handler:", error);
    throw error;
  }
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
    logger.info(
      `Step ${job.data.currentStepId} queued for queue ${job.data.queueId}`
    );
  }
});

export default worker;
