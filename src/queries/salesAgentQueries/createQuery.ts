import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface SalesAgenData {
  name: string;
  phoneNumber: string;
  fullText: string;
}

export async function createQuery(salesAgentData: SalesAgenData) {
  try {
    const salesAgent = await prisma.salesAgent.findFirst({
      where: {
        fullText: {
          contains: salesAgentData.fullText,
          mode: "insensitive",
        },
      },
    });

    if (!salesAgent) {
      logger.info("22/createQuery Sales Agent not yet exist creating new one");
    } else {
      return {
        success: true,
        message: "Sales agent found",
        salesAgentId: salesAgent.id,
      };
    }

    const newAgent = await prisma.salesAgent.create({
      data: {
        name: salesAgentData.name,
        phoneNumber: salesAgentData.phoneNumber,
        fullText: salesAgentData.fullText,
      },
    });

    return {
      success: false,
      message: "Created new sales agent",
      data: newAgent,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create sales agent ${error}`,
    };
  }
}
