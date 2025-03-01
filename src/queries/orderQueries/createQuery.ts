import prisma from "../../services/prisma";

export interface OrderData {
  id: number;
  orderNumber: string;
  phoneNumber: string;
  userName: string;
  userSurname?: string;
  companyName?: string;
  paymentMethodName: string;
  totalAmount: number;
  salesAgentId: string;
  country: string;
  orderDate: Date;
  city: string;
  customerId: string;
  productNames: string[];
  productIds: string[];
}

export async function createOrder(orderData: OrderData) {
  try {
    const order = await prisma.order.create({
      data: {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        phoneNumber: orderData.phoneNumber,
        userName: orderData.userName,
        userSurname: orderData.userSurname,
        companyName: orderData.companyName,
        paymentMethodName: orderData.paymentMethodName,
        totalAmount: orderData.totalAmount,
        salesAgentId: orderData.salesAgentId,
        country: orderData.country,
        city: orderData.city,
        orderDate: orderData.orderDate,
        customerId: orderData.customerId,
        productNames: orderData.productNames,
        productIds: orderData.productIds,
        customer: {
          connect: {
            id: orderData.customerId
          }
        }
      },
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create order: ${error}`,
    };
  }
}
