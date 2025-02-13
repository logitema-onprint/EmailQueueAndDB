import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getQueueCount(status: string) {
  try {
    const count = await prisma.job.count({
      where: { status }
    });

    logger.info(
      `Successfully got queue count for status: ${status} count: ${count}`
    );

    return count;
  } catch (error) {
    logger.error("Failed to get queue count", error);
    throw error;
  }
}
