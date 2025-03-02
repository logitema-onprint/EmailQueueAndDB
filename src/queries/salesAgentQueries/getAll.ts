import prisma from "../../services/prisma";

export async function getAll() {
  try {
    const salesAgents = await prisma.salesAgent.findMany();

    return {
      success: true,
      message: `Successfuly got all agenst`,
      data: salesAgents,
    };
  } catch (error) {
    return {
      success: false,
      mesage: `Failed to get sales agents`,
    };
  }
}
