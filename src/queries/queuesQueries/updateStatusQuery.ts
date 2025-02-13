import { EmailQueue } from "../../queues/emailQueue";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export const updateStatusQuery = (jobId: string, update: {
  status: string;
  processed?: boolean;
  error?: string;
}) => {
  const timestamp = new Date().toISOString();
  const data = {
    status: update.status,
    attempts: { increment: 1 },
    ...(update.processed && { processedAt: timestamp }),
    ...(update.error && { error: update.error })
  };


  return prisma.job.update({
    where: { id: jobId },
    data
  });
}

