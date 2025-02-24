import prisma from "../../services/prisma";
import logger from "../../utils/logger";

interface DeleteJobsParams {
  tagIds?: number[];
  orderIds?: number[];
  status?: string[] | string;
  jobIds?: string[];
}

export async function deleteManyJobs({
  tagIds,
  orderIds,
  status,
  jobIds,
}: DeleteJobsParams): Promise<number> {
  try {
    const where: any = {};

    if (tagIds?.length) {
      where.tagId = { in: tagIds };
    }
    if (orderIds?.length) {
      where.orderId = { in: orderIds };
    }
    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }
    if (jobIds?.length) {
      where.id = { in: jobIds };
    }

    const result = await prisma.job.deleteMany({
      where,
    });

    logger.info(
      `Deleted ${result.count} jobs matching criteria: ${JSON.stringify({
        orderCount: orderIds?.length || 0,
        tagCount: tagIds?.length || 0,
        status,
        jobCount: jobIds?.length || 0,
      })}`
    );

    return result.count;
  } catch (error) {
    logger.error("Failed to delete jobs", error);
    throw error;
  }
}
