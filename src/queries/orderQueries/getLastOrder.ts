import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getLastOrder(customerId: string, newOrderId: number) {
  try {
    const lastOrder = await prisma.order.findFirst({
      where: {
        customerId: customerId,
      },
      orderBy: {
        orderDate: "desc",
      },
    });
    if (lastOrder) {
      logger.info(`Last order id:${lastOrder.id} `);
      const orderToInactive =
        newOrderId > lastOrder.id ? lastOrder.id : newOrderId;

      return {
        success: true,
        message: `Custmer:${lastOrder.customerId} have previos orders`,
        isLast: true,
        orderToInactive: orderToInactive,
      };
    }
    return {
      success: true,
      message: `First order from this custumer`,
      isLast: false,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to find any orders`,
    };
  }
}
