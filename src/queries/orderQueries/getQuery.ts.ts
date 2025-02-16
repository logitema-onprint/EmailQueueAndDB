import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getOrder(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        jobs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: `Order with ID ${orderId} not found`,
      };
    }

    logger.info(`Found order ${orderId} with ${order.jobs.length} jobs`);

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    logger.error(`Failed to get order ${orderId}`, error);
    return {
      success: false,
      error: `Failed to get order: ${error}`,
    };
  }
}
