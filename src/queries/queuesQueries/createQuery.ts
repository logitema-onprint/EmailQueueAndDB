import { error } from 'console';
import prisma from "../../services/prisma";
import logger from '../../utils/logger';

export interface JobItem {
  jobId: string
  orderId: string;
  tagId: string;
  tagName: string;
  status: string;
  scheduledFor: number;
  updatedAt: string
  processedAt?: string | null;
  createdAt?: Date;
  error: null,
}

export async function createQueue(jobData: JobItem) {
  try {
    const job = await prisma.job.create({
      data: {
        id: jobData.jobId,
        orderId: jobData.orderId,
        tagId: jobData.tagId,
        tagName: jobData.tagName,
        status: jobData.status,
        attempts: 0,
        error: jobData.error,
        scheduledFor: jobData.scheduledFor,
        processedAt: jobData.processedAt,
        updatedAt: jobData.updatedAt,
      }
    })
    logger.success("Job created")
    return { success: true, data: job }
  } catch (error) {
    return { success: false, error: `Failed to create job: ${error}` }
  }
}
