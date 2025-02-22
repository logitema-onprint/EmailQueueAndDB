import prisma from "../../services/prisma";
import { FilteredOrders } from "../../types/orderApi";
import logger from "../../utils/logger";

export async function getOrderIds(
  where: FilteredOrders["filters"],
  batchSize: number,
  lastProcessedId?: number 
) {
  try {
    const orderIds = await prisma.order.findMany({
      where: {
        AND: [
          where,
      
          lastProcessedId ? { id: { gt: lastProcessedId } } : {}
        ]
      },
      take: batchSize,
      orderBy: {
        id: 'asc'
      },
      select: { id: true }
    });

    return {
      success: true,
      orderIds: orderIds.map((order) => order.id)
    };
  } catch (error) {
    logger.error("Failed to get orders by Id", error);
    return {
      success: false,
      error: `Failed to get orders by Ids ${error}`,
      jobIds: [],
    };
  }
}