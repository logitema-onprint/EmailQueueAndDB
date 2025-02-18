import { EmailQueue } from "../../queues/emailQueue";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function deleteOrder(orderId: number) {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error(`Order with ID ${orderId} does not exist`);
    }
    const order = await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return {
        success: false,
        error: `Order with ID ${orderId} not found`,
      };
    }

    logger.info(`Order deleted ${order.id}`);

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    logger.error(`Failed to delete ${orderId}`, error);
    return {
      success: false,
      error: `Failed to delete ${error}`,
    };
  }
}
