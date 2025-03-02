import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function updateOrderLastKey(orderId: number) {
  try {
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isLast: false,
      },
    });
    logger.info("Updated successfuly");
    return {
      success: true,
      message: "Updated last key ",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update orders isLast key ${error}`,
    };
  }
}
