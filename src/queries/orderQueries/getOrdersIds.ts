import prisma from "../../services/prisma";
import { FilteredOrders } from "../../types/orderApi";
import logger from "../../utils/logger";

export async function getOrderIds(
  where: FilteredOrders["filters"],
  batchSize: number,
  skip?: number
) {
  try {
    const orderIds = await prisma.order.findMany({
      where: where,
      take: batchSize,
      skip: skip,
      select: { id: true },
    });

    return {
      success: true,
      orderIds: orderIds.map((order) => order.id),
    };
  } catch (error) {
    logger.error("Failed to get orders by Id", error);
    return {
      success: false,
      error: `Failed to get  orders by Ids ${error}`,
      jobIds: [],
    };
  }
}
