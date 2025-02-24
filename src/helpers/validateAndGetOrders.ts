import { orderQueries } from "../queries/orderQueries";

export async function validateAndGetExistingOrders(orderIds: number[]) {
  const orderPromises = orderIds.map((orderId) =>
    orderQueries.getOrder(orderId)
  );
  const orderResults = await Promise.all(orderPromises);

  const existingOrderIds = orderResults
    .filter((result) => result !== undefined && result.data !== undefined)
    .map((result) => result.data.id);

  const missingOrderIds = orderIds.filter(
    (id) => !existingOrderIds.includes(id)
  );

  return {
    existingOrderIds,
    missingOrderIds,
    totalOrders: orderIds.length,
  };
}
