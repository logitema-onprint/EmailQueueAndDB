import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface ProductOrderData {
  orderId: number;
  productId: string;
  salesAgentId: number;
  salesAgentFullText: string;
  quaninty: number;
  totalAmount: number;
  orderDate: string;
  country: string;
  city: string;
}

export async function createQuery(productOrderData: ProductOrderData) {
  try {
    const productOrder = await prisma.orderProduct.create({
      data: {
        salesAgentFullText: productOrderData.salesAgentFullText,
        productId: productOrderData.productId,
        orderId: productOrderData.orderId,
        salesAgentId: productOrderData.salesAgentId,
        city: productOrderData.city,
        country: productOrderData.country,
        quantity: productOrderData.quaninty,
        totalAmount: productOrderData.totalAmount,
        orderDate: productOrderData.orderDate,
      },
    });
    return {
      success: true,
      message: "Created productOrder",
      data: productOrder.id,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create productOrder ${error}`,
    };
  }
}
