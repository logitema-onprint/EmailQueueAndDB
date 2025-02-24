import { logger } from "@sentry/core";
import prisma from "../../../services/prisma";

export async function deleteOrdersById(orderIds: number[]) {
  try {
    const existingOrders = await prisma.order.count({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    if (existingOrders === 0) {
      return {
        success: false,
        message: "Orders not exist anymore",
      };
    }
    const deleteResult = await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    return {
      success: true,
      deletedOrderCount: deleteResult.count,
    };
  } catch (error) {
    logger.error(`delete query: ${error}`);
    return {
      success: false,
      error: `Failed to delete provided orders`,
    };
  }
}
