import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { v4 as uuidv4 } from "uuid";
import { queuesQueries } from "../../queries/queuesQueries";
import { QueueItem } from "../../types/queueApi";
import { tagQueries } from "../../queries/tagQueries";
import { RevalidateService } from "../../services/revalidateNext";
import { log } from "console";

interface CreateQueueRequest {
  email: string;
  tags: Array<{
    tagId: string;
    tagName: string;
    scheduledFor: number;
  }>;
}

export const createQueue: RequestHandler = async (
  req: Request<{}, {}, CreateQueueRequest>,
  res: Response
) => {
  try {
    const { email, tags } = req.body;
  

    if (!email || !tags || tags.length === 0) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const timestamp = new Date().toISOString();
    const createdJobs = [];

    for (const tag of tags) {
      const jobId = uuidv4();
      const job = await EmailQueue.add(
        "email-job",
        {
          queueId: jobId,
          tagName: tag.tagName,
          tagId: tag.tagId,
        },
        {
          jobId,
          delay: tag.scheduledFor,
          attempts: 3,
        }
      );

      // Prepare queue item for database
      const queueItem: QueueItem = {
        jobId,
        tagId: tag.tagId,
        tagName: tag.tagName,
        email,
        status: "QUEUED",
        attempts: 3,
        createdAt: timestamp,
        updatedAt: timestamp,
        scheduledFor: tag.scheduledFor,
        processedAt: undefined,
        error: undefined,
      };

      const result = await queuesQueries.createQueue(queueItem);
      await tagQueries.updateTagJobCountQuery(tag.tagId, "increment");

      if (result.error) {
        await job.remove();
        throw new Error(
          `Failed to create queue for tag ${tag.tagName}: ${result.error}`
        );
      }

      createdJobs.push({
        queueId: jobId,
        jobId: job.id,
        tag: tag.tagName,
      });
    }
    await RevalidateService.revalidateTag();

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdJobs.length} queue jobs`,
      data: createdJobs,
    });
  } catch (error) {
    logger.error("Failed to create queues", error);

    res.status(500).json({
      success: false,
      message: "Failed to create queues",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
