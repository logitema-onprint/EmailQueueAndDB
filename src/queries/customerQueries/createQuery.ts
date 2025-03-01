import prisma from "../../services/prisma";
import { Customer } from "@prisma/client";
import logger from "../../utils/logger";

export interface CustumerData {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  company: string | null | undefined;
  registerDate: string;
  rewardPoints: string | null | undefined;
  extrafields: string | null | undefined;
}

export async function createQuery(custumerData: CustumerData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: custumerData.id,
      },
    });
    if (!customer) {
      logger.info("26/createQuery Custumer not exist yet creating new one:");
    } else {
      return {
        success: true,
        message: "Repeated custumer",
      };
    }

    const data = await prisma.customer.create({
      data: {
        id: custumerData.id,
        fullName: custumerData.fullName,
        firstName: custumerData.firstName,
        lastName: custumerData.lastName,
        phoneNumber: custumerData.phoneNumber,
        email: custumerData.email,
        company: custumerData.company ?? undefined,
        registerDate: custumerData.registerDate,
        rewardPoints: custumerData.rewardPoints ?? undefined,
        extrafields: custumerData.extrafields ?? undefined,
      },
    });
    return {
      success: true,
      message: "Succesfully created new custumer",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create customer ${error}`,
    };
  }
}
