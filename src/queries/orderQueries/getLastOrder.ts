import prisma from "../../services/prisma";

export async function getLastOrder(customerId: string) {
  try {
    const lastOrder = await prisma.order.findFirst({
      where: {
        customerId: customerId,
        isLast: true,
      },
    });
    if (lastOrder) {
      return {
        success: true,
        message: `Custmer:${lastOrder.customerId} have previos orders`,
        isLast: true,
        orderId: lastOrder.id,
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
