import { RequestHandler, Request, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { JobStatus } from "bull";
import { queuesQueries } from "../../queries/queuesQueries";
import { PausedQueue } from "../../queues/pausedQueue";
import logger from "../../utils/logger";
import { convertBullToDynamoStatus } from "../../helpers/convertBullToDynamoStatus";
import { log } from "console";

export const getAllQueuesByStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { status } = req.params;
    const validStatus = [
      "active",
      "completed",
      "failed",
      "delayed",
      "waiting",
      "paused",
    ] as const;
    const dynamoStatus = convertBullToDynamoStatus(status as JobStatus);

    if (!status || !validStatus.includes(status as JobStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatus.join(",")}`,
      });
    }
    const jobs =
      status === "paused"
        ? await PausedQueue.getJobs([status as JobStatus])
        : await EmailQueue.getJobs([status as JobStatus]);
    const result = await queuesQueries.getQueuesByStatus(dynamoStatus, 20);
    const dyanmoJobCount = await queuesQueries.getQueueCount(dynamoStatus)

    res.status(200).json({
      success: true,
      bullJobCount: jobs.length,
      bullJobIds: jobs.map((job) => job.id),
      dynamoDBJobCount: dyanmoJobCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get jobs",
    });
  }
};
