import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface OrderData {
  id: number;
  orderNumber: string;
  phoneNumber: string;
  userName: string;
  paymentStatus: string;
  userSurname?: string;
  companyName?: string;
  paymentMethodName: string;
  totalAmount: number;
  salesAgentId: number;
  country: string;
  orderDate: string;
  city: string;
  isLast: boolean;
  customerId: string;
  productNames: string[];
  productIds: string[];
}

export async function createOrder(orderData: OrderData) {
  try {
    // First check if the order already exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: Number(orderData.id),
      },
    });

    if (existingOrder) {
      const createJobs = existingOrder.paymentStatus === "Apmokėta";
      return {
        createJobs: createJobs,
        orderExist: true,
        message: "Order already exists",
      };
    }

    if (orderData.paymentStatus !== "Apmokėta") {
      logger.warn("Neapmokėtas užsakymas");
      return {
        success: true,
        orderExist: false,
        createJobs: false,
        message: "Order not created - payment status is not Apmokėta",
      };
    }

    const order = await prisma.order.create({
      data: {
        id: Number(orderData.id),
        orderNumber: orderData.orderNumber,
        phoneNumber: orderData.phoneNumber,
        userName: orderData.userName,
        paymentStatus: orderData.paymentStatus,
        userSurname: orderData.userSurname,
        companyName: orderData.companyName,
        paymentMethodName: orderData.paymentMethodName,
        totalAmount: Number(orderData.totalAmount),
        salesAgentId: orderData.salesAgentId,
        country: orderData.country,
        city: orderData.city,
        orderDate: orderData.orderDate,
        customerId: orderData.customerId,
        productNames: orderData.productNames,
        isLast: orderData.isLast,
        productIds: orderData.productIds,
        customer: {
          connect: {
            id: orderData.customerId,
          },
        },
      },
    });

    return {
      success: true,
      orderExist: false,
      createJobs: true,
      data: order,
      message: "Order created successfully",
    };
  } catch (error) {
    return {
      success: false,
      orderExist: false,
      createJobs: false,
      error: `Failed to create order: ${error}`,
      message: `Failed to create order: ${error}`,
    };
  }
}
