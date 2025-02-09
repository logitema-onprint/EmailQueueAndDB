import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { v4 as uuidv4 } from "uuid";
import { queuesQueries } from "../../queries/queuesQueries";
import { QueueItem } from "../../types/queueApi";

export const createQueue: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, tag, scheduledFor } = req.body;

    if (!email || !tag || !scheduledFor) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    logger.info("Email event received", {
      email,
      tag,
      scheduledFor,
    });

    const id = uuidv4();

    const job = await EmailQueue.add(
      "email-job",
      {
        queueId: id,
        email,
        tag,
        payload: {
          message: "Yo guys this the payload",
        },
      },
      {
        jobId: id,
        delay: scheduledFor,
        attempts: 3,
      }
    );

    const timestamp = new Date().toISOString();

    const queueItem: QueueItem = {
      jobId: id,
      tag: tag,
      email: email,
      status: "PENDING",
      attempts: 3,
      payload: {
        message: "Yo guys this the payload",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      scheduledFor: scheduledFor,
    };

    const result = await queuesQueries.createQueue(queueItem);
    if (result.error) {
      await job.remove();
      throw new Error(result.error);
    }

    res.status(201).json({
      success: true,
      message: "Email queued successfully",
      data: {
        queueId: id,
        jobId: job.id,
      },
    });
  } catch (error) {
    logger.error("Failed to create email event", error);

    res.status(500).json({
      message: "Failed to create email event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
