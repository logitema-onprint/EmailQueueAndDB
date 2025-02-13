import { queuesQueries } from ".";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function deleteQueue(jobId: string) {
  try {

    await prisma.job.delete({
      where: { id: jobId }
    });

    return {
      success: true,
      message: "Eilė buvo sėkmingai ištrinta"
    };
  } catch (error: any) {


    return {
      success: false,
      error: `Nepavyko ištrinti eilės: ${error}`
    };
  }
}