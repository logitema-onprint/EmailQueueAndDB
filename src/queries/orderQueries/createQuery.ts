import prisma from "../../services/prisma";

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
  customerId: string;
  productNames: string[];
  productIds: string[];
}

export async function createOrder(orderData: OrderData) {
  try {
    const findUnique = await prisma.order.findUnique({
      where: {
        id: Number(orderData.id),
      },
    });
    if (findUnique) {
      const createJobs = findUnique.paymentStatus === "Apmokėta";
      return {
        createJobs: createJobs,
        orderExist: true,
        message: "Order already exsit",
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
        productIds: orderData.productIds,
        customer: {
          connect: {
            id: orderData.customerId,
          },
        },
      },
    });
    const createJobs = order.paymentStatus === "Apmokėta";
    return {
      success: true,
      orderExist: false,
      createJobs: createJobs,
      data: order,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create order: ${error}`,
    };
  }
}
