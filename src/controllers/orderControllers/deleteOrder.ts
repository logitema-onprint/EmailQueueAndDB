import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import prisma from "../../services/prisma";
import { QueueService } from "../../services/queueService";

export const deleteOrder: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const jobs = await prisma.job.findMany({
      where: { orderId: orderId },
      select: { id: true },
    });
    const jobIds = jobs.map((job) => job.id);
    await QueueService.removeJobsFromQueues(jobIds);

    const result = await orderQueries.deleteOrder(orderId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const checkJobs = await prisma.job.findMany({
      where: { orderId: orderId },
    });

    if (checkJobs.length === 0) {
      logger.info(
        `All jobs acciociated with order: ${result.data?.id} deleted `
      );
    }

    res.status(200).json({
      success: true,
      message: "Order and jobs deleted",
    });
  } catch (error) {
    logger.error("Failed to delete order", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};
