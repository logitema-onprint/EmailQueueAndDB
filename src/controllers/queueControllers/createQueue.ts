import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { v4 as uuidv4 } from "uuid";
import { queuesQueries } from "../../queries/queuesQueries";
import { QueueItem, Step } from "../../types/queueApi";

interface CreateQueueRequest {
  email: string;
  tag: string;
  scheduledFor: number;
  steps: Record<string, Step>;
}

export const createQueue: RequestHandler = async (
  req: Request<{}, {}, CreateQueueRequest>,
  res: Response
) => {
  try {
    const { email, tag, scheduledFor, steps } = req.body;

    if (!email || !tag || !scheduledFor || !steps) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    if (Object.keys(steps).length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one step is required",
      });
      return;
    }

    logger.info("Email queue event received", {
      email,
      tag,
      scheduledFor,
      stepsCount: Object.keys(steps).length,
    });

    const jobId = uuidv4();
    const timestamp = new Date().toISOString();
    const currentStepId = steps.step1.stepId;
    const job = await EmailQueue.add(
      "email-job",
      {
        queueId: jobId,
        email,
        tag,
        currentStep: 0,
        currentStepId: currentStepId,
        steps,
      },
      {
        jobId,
        delay: scheduledFor,
        attempts: 3,
      }
    );

    const queueItem: QueueItem = {
      jobId,
      tag,
      email,
      status: "QUEUED",
      attempts: 3,
      currentStepId: currentStepId,
      steps,
      createdAt: timestamp,
      updatedAt: timestamp,
      scheduledFor,
      processedAt: undefined,
      error: undefined,
    };

    const result = await queuesQueries.createQueue(queueItem);

    if (result.error) {
      await job.remove();
      throw new Error(result.error);
    }

    res.status(201).json({
      success: true,
      message: "Queue created successfully",
      data: {
        queueId: jobId,
        jobId: job.id,
        steps: Object.keys(steps).length,
      },
    });
  } catch (error) {
    logger.error("Failed to create queue", error);

    res.status(500).json({
      success: false,
      message: "Failed to create queue",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
