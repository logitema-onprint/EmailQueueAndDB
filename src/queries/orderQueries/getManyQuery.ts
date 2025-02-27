import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getAllOrders({
  limit = 25,
  page = 1,
  includeTotalCount = false,
}) {
  try {
    const offset = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          jobs: true,
        },
        skip: offset,
        take: limit,
      }),
      includeTotalCount ? prisma.order.count() : Promise.resolve(undefined),
    ]);

    logger.info(`Found ${totalCount || orders.length} orders`);

    return {
      success: true,
      orders,
      totalCount: includeTotalCount ? totalCount ?? 0 : 0,
    };
  } catch (error) {
    logger.error(`Failed to get orders`, error);
    return {
      success: false,
      orders: [],
      totalCount: 0,
      error: `Failed to get orders: ${error}`,
    };
  }
}
