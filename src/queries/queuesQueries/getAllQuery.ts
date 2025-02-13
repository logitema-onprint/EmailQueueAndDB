import prisma from "../../services/prisma";
import logger from "../../utils/logger";

interface QueryResult {
  jobs: any[];
  totalCount: number | 0;
}

interface QueryParams {
  tagIds?: string[];
  status?: string;
  limit?: number;
  page?: number;
  includeTotalCount?: boolean;
}

export async function getAllQuery({
  tagIds,
  status,
  limit = 50,
  page = 1,
  includeTotalCount = false,
}: QueryParams): Promise<QueryResult> {
  try {
    const offset = (page - 1) * limit;

    const where: any = {};
    if (tagIds?.length) {
      where.tagId = { in: tagIds };
    }
    if (status) {
      where.status = status;
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      includeTotalCount
        ? prisma.job.count({ where })
        : Promise.resolve(undefined),
    ]);

    logger.info(
      `Found ${totalCount || jobs.length} jobs${
        tagIds ? ` for tagIds ${tagIds.join(", ")}` : ""
      }${status ? ` with status ${status}` : ""}`
    );

    return {
      jobs,
      totalCount: includeTotalCount ? totalCount ?? 0 : 0,
    };
  } catch (error) {
    const tagInfo = tagIds?.length ? ` for tagIds ${tagIds.join(", ")}` : "";
    const statusInfo = status ? ` with status ${status}` : "";

    logger.error(`Failed to get jobs${tagInfo}${statusInfo}`, error);
    throw error;
  }
}
