import prisma from "../../services/prisma";

export interface OrderData {
  phoneNumber: string;
  userName: string;
  userSurname?: string;
  companyName?: string;
  paymentDetails: string;
  subTotal: number;
  salesAgentId: string;
  country: string;
  city: string;
  customerId: string;
  productName: string;
  productId: number;
}

export async function createOrder(orderData: OrderData) {
  try {
    const order = await prisma.order.create({
      data: {
        phoneNumber: orderData.phoneNumber,
        userName: orderData.userName,
        userSurname: orderData.userSurname,
        companyName: orderData.companyName,
        paymentDetails: orderData.paymentDetails,
        subTotal: orderData.subTotal,
        salesAgentId: orderData.salesAgentId,
        country: orderData.country,
        city: orderData.city,
        customerId: orderData.customerId,
        productName: orderData.productName,
        productId: orderData.productId
      }
    });

    return {
      success: true,
      data: order
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create order: ${error}`
    };
  }
}