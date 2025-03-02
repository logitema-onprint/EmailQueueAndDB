import prisma from "../../services/prisma";

export async function updateJobCount(id: number) {
  try {
    const updateJobCount = await prisma.salesAgent.update({
      where: {
        id: id,
      },
      data: {
        orderCount: { increment: 1 },
      },
    });

    return {
      success: false,
      message: `Job count for salesAgent ${updateJobCount.name} updated`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to increment jobcount: ${error}`,
    };
  }
}
