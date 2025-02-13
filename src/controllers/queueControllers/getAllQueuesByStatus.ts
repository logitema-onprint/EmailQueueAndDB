import { RequestHandler, Request, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { JobStatus } from "bull";
import { queuesQueries } from "../../queries/queuesQueries";
import { PausedQueue } from "../../queues/pausedQueue";
import logger from "../../utils/logger";
import { bullToDbStatus } from "../../helpers/bullToDbStatus";

export const getAllQueuesByStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, tagIds } = req.body;
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = 25;

    const validStatus = [
      "completed",
      "failed",
      "delayed",
      "waiting",
      "paused",
      "active",
    ] as const;

    if (status && !validStatus.includes(status as JobStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatus.join(",")}`,
      });
    }

    if (tagIds) {
      const bullJobs = await EmailQueue.getJobs([tagIds]);

      logger.info(bullJobs);
    }

    const dbStatus = bullToDbStatus(status as JobStatus);

    const queryParams = {
      ...(dbStatus && { status: dbStatus }),
      ...(tagIds && { tagIds }),
      page,
      limit: itemsPerPage,
      includeTotalCount: true,
    };

    const { jobs, totalCount } = await queuesQueries.getAllQuery(queryParams);

    res.status(200).json({
      success: true,
      data: {
        postgres: {
          jobCount: totalCount,
          items: jobs,
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
