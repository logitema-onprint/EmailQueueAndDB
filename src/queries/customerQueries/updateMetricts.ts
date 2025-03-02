import prisma from "../../services/prisma";

export async function updateCustomerMetrics(totalSpend: number, id: string) {
  try {
    await prisma.customer.update({
      where: { id: id },
      data: {
        totalOrders: { increment: 1 },
        totalSpend: { increment: totalSpend },
        updatedAt: new Date(),
      },
    });
    return {
      success: true,
      message: "Updated custumer metricts",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update ${error}`,
    };
  }
}
