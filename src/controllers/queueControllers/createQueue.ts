import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { v4 as uuidv4 } from "uuid";
import { queuesQueries } from "../../queries/queuesQueries";
import { QueueItem } from "../../types/queueApi";
import { tagQueries } from "../../queries/tagQueries";
import { RevalidateService } from "../../services/revalidateNext";
import { JobItem } from "../../queries/queuesQueries/createQuery";



export const createQueue: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { tags, orderId } = req.body;
    logger.info(req.body)


    if (!orderId || !tags || tags.length === 0) {
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
          jobId: jobId,
          tagName: tag.tagName,
          tagId: tag.tagId
        },
        {
          jobId: jobId,
          delay: tag.scheduledFor,
          attempts: 3,
        }
      );

      // Prepare queue item for database
      const queueItem: JobItem = {
        orderId: orderId,
        jobId,
        tagId: tag.tagId,
        tagName: tag.tagName,
        status: "QUEUED",
        updatedAt: timestamp,
        scheduledFor: tag.scheduledFor,
        processedAt: undefined,
        error: null,
      };

      const result = await queuesQueries.createQueue(queueItem);
      // await tagQueries.updateTagJobCountQuery(tag.tagId, "increment")


      if (result.error) {
        await job.remove();
        throw new Error(`Failed to create queue for tag ${tag.tagName}: ${result.error}`);
      }

      createdJobs.push({
        queueId: jobId,
        jobId: job.id,
        tag: tag.tagName
      });
    }
    // await RevalidateService.revalidateTag()

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