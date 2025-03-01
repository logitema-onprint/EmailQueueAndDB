import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface ProductMetrics {
  totalOrderedQuaninty: number;
  totalOrderCount: number;
  totalRevenue: number;
}

export async function updateProductMetrics(
  productId: string,
  metrics: ProductMetrics
) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        totalOrderedQuantity: { increment: metrics.totalOrderedQuaninty },
        totalOrderCount: { increment: metrics.totalOrderCount },
        totalRevenue: { increment: metrics.totalRevenue },
      },
    });

    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    console.error("Error updating product metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
