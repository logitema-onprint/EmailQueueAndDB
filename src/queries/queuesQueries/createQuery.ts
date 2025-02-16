import { error } from "console";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";
import { Job, Prisma } from "@prisma/client";

export interface JobItem {
  id: string;
  orderId?: number | undefined;
  tagId: number;
  tagName: string;
  status: string;
  scheduledFor: bigint;
  updatedAt: string;
  processedAt?: string | null;
  createdAt?: Date;
  error: null;
}

export async function createQueue(jobData: JobItem) {
  try {
    const job = await prisma.job.create({
      data: {
        id: jobData.id,
        orderId: jobData?.orderId ?? undefined,
        tagId: jobData.tagId,
        tagName: jobData.tagName,
        status: jobData.status,
        attempts: 0,
        error: jobData.error,
        scheduledFor: jobData.scheduledFor as bigint,
        processedAt: jobData.processedAt,
        updatedAt: jobData.updatedAt,
      },
    });
    logger.success("Job created");
    return { success: true, data: job };
  } catch (error) {
    return { success: false, error: `Failed to create job: ${error}` };
  }
}
