import { Job } from "@prisma/client";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

interface QueryResult {
  jobs: Job[];
  totalCount: number;
}

interface QueryParams {
  tagIds?: number[];
  orderIds?: number[];
  status?: string[] | string;
  limit?: number;
  skip?: number;
  includeTotalCount?: boolean;
}

export async function getAllQuery({
  tagIds,
  orderIds,
  status,
  includeTotalCount = false,
}: QueryParams): Promise<QueryResult> {
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
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        }
      }),
      includeTotalCount
        ? prisma.job.count({ where })
        : Promise.resolve(0),
    ]);

    logger.info(
      `Found ${jobs.length} jobs for ${orderIds?.length || 0} orders with status ${status}`
    );

    return {
      jobs,
      totalCount: includeTotalCount ? totalCount : 0,
    };
  } catch (error) {
    logger.error("Failed to get jobs", error);
    throw error;
  }
}