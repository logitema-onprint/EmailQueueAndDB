import { Request, Response } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { PausedQueue } from "../../queues/pausedQueue";
import logger from "../../utils/logger";

export const getQueueStats = async (req: Request, res: Response) => {
  try {
    const [emailStats, pausedStats] = await Promise.all([
      EmailQueue.getJobCounts(),
      PausedQueue.getJobCounts(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        emailQueue: {
          active: emailStats.active,
          completed: emailStats.completed,
          failed: emailStats.failed,
          delayed: emailStats.delayed,
          waiting: emailStats.waiting,
          paused: emailStats.paused,
          total: Object.values(emailStats).reduce((a, b) => a + b, 0),
        },
        pausedQueue: {
          active: pausedStats.active,
          completed: pausedStats.completed,
          failed: pausedStats.failed,
          delayed: pausedStats.delayed,
          waiting: pausedStats.waiting,
          paused: pausedStats.paused,
          total: Object.values(pausedStats).reduce((a, b) => a + b, 0),
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get queue status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get queue status",
    });
  }
};
