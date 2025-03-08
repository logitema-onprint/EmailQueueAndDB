import prisma from "../../services/prisma";

export async function getCustomerInfo(email: string) {
  try {
    const customerInfo = await prisma.customer.findFirst({
      where: {
        email: email,
      },
      include: {
        orders: {
          orderBy: {
            orderDate: "desc",
          },
          take: 3,
        },
      },
    });

    if (!customerInfo) {
      return {
        success: false,
        message: "Customer not found",
      };
    }

    return {
      success: true,
      customer: customerInfo,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching customer information",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
