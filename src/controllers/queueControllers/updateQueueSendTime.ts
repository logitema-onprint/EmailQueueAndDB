import { Response, Request, RequestHandler } from "express";
import { EmailQueue } from "../../queues/emailQueue";
import { QueueService } from "../../services/queueService";

export const updateQueueSendTime: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;
    const { sendTime } = req.body;
    if (!jobId || !sendTime) {
      res.status(400).json({
        success: false,
        message: "Missing jobId or sendTime",
      });
    }
    const job = await QueueService.getJobFromQueues(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: `Job ${jobId} not found in any quque`,
      });
      return;
    }

    const now = Date.now();
    await job.job.changeDelay(sendTime);

    res.status(200).json({
      success: true,
      message: `${sendTime} `,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
