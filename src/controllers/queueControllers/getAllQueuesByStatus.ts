import { RequestHandler, Request, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { JobStatus } from "bull";
import { queuesQueries } from "../../queries/queuesQueries";
import { PausedQueue } from "../../queues/pausedQueue";
import logger from "../../utils/logger";
import { convertBullToDynamoStatus } from "../../helpers/convertBullToDynamoStatus";

export const getAllQueuesByStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const itemsPerPage = 25;
    const lastEvaluatedKey = req.query.lastEvaluatedKey
      ? JSON.parse(req.query.lastEvaluatedKey as string)
      : undefined;

    const validStatus = [
      "active",
      "completed",
      "failed",
      "delayed",
      "waiting",
      "paused",
    ] as const;

    if (!status || !validStatus.includes(status as JobStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatus.join(",")}`,
      });
    }

    const dynamoStatus = convertBullToDynamoStatus(status as JobStatus);

    const jobs =
      status === "paused"
        ? await PausedQueue.getJobs([status as JobStatus])
        : await EmailQueue.getJobs([status as JobStatus]);

    const totalItems = await queuesQueries.getQueueCount(dynamoStatus);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const result = await queuesQueries.getQueuesByStatus(
      dynamoStatus,
      itemsPerPage,
      lastEvaluatedKey
    );

    res.status(200).json({
      success: true,
      data: {
        bull: {
          bullJobCount: jobs.length,
          bullJobIds: jobs.map((job) => job.id),
        },
        dynamo: {
          dynamoJobCount: totalItems,
          items: result.items,
        },
      },
      pagination: {
        currentPage: page,
        totalPages,
        itemsPerPage: itemsPerPage,
        totalItems,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      lastEvaluatedKey: result.lastEvaluatedKey,
    });
  } catch (error) {
    logger.error("Failed to get jobs", error);
    res.status(500).json({
      success: false,
      message: "Failed to get jobs",
    });
  }
};
