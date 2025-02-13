import { queuesQueries } from ".";
import prisma from "../../services/prisma";
import { QueueService } from "../../services/queueService";
import logger from "../../utils/logger";

type Status = "SENT" | "FAILED" | "SENDING" | "QUEUED" | "PAUSED";

interface UpdateStatus {
  status: Status;
  processed?: boolean;
  error?: string;
  incrementAttempts?: boolean;
}

export const updateStatusQuery = async (
  jobId: string,
  update: UpdateStatus
) => {
  const timestamp = new Date().toISOString();

  const data = {
    status: update.status,
    ...(update.incrementAttempts && { attempts: { increment: 1 } }),
    ...(update.processed && { processedAt: timestamp }),
    ...(update.error && { error: update.error }),
  };

  const job = await QueueService.getJobFromQueues(jobId);

  if (!job?.data?.id) {
    logger.warn("Job not yet exist or lost");
    return;
  }
  await prisma.job.update({
    where: { id: jobId },
    data,
  });
};
