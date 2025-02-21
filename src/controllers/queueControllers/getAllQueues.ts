import { RequestHandler, Request, Response } from "express";
import { JobStatus } from "bull";
import { queuesQueries } from "../../queries/queuesQueries";
import logger from "../../utils/logger";
import { bullToDbStatus } from "../../helpers/bullToDbStatus";
import { serializeBigInt } from "../../helpers/serializeBigInt";

type ExtendedJobStatus = JobStatus | "inactive";

export const getAllQueues: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const statuses = req.query.status
      ? (req.query.status as string).split(",")
      : [];
    const tagIds = req.query.tagIds
      ? (req.query.tagIds as string).split(",").map(Number)
      : [];
    const orderIds = req.query.orderIds
      ? (req.query.orderIds as string).split(",").map(Number)
      : [];
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = 25;

    logger.info("Params:", tagIds, statuses, orderIds);

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
      });
    }

    const validStatus = [
      "active",
      "completed",
      "failed",
      "delayed",
      "waiting",
      "paused",
      "inactive",
    ] as const;

    if (
      statuses.length &&
      !statuses.every((status) =>
        validStatus.includes(status as ExtendedJobStatus)
      )
    ) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatus.join(",")}`,
      });
    }

    const dbStatuses = statuses.map((status) =>
      bullToDbStatus(status as ExtendedJobStatus)
    );

    console.log(dbStatuses);

    const queryParams = {
      ...(dbStatuses.length > 0 && { status: dbStatuses }),
      ...(tagIds.length > 0 && { tagIds }),
      ...(orderIds.length > 0 && { orderIds }),
      page,
      limit: itemsPerPage,
      includeTotalCount: true,
    };

    const { jobs, totalCount } = await queuesQueries.getAllQuery(queryParams);

    const transformedJobs = serializeBigInt(jobs);

    res.status(200).json({
      success: true,
      data: {
        postgres: {
          jobCount: totalCount,
          items: transformedJobs,
        },
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        itemsPerPage,
        totalItems: totalCount,
        nextPage: page < Math.ceil(totalCount / itemsPerPage) ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        hasNextPage: page * itemsPerPage < totalCount,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    logger.error("Failed to get jobs", error);
    res.status(500).json({
      success: false,
      message: "Failed to get jobs",
    });
  }
};
