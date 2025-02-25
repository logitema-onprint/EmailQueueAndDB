import prisma from "../../services/prisma";
import logger from "../../utils/logger";

type Status = "SENT" | "FAILED" | "SENDING" | "QUEUED" | "PAUSED" | "INACTIVE";

export const updateManyStatusQuery = async (
  jobIds: string[],
  update: { status: Status }
) => {
  if (!jobIds.length) {
    logger.warn("No job IDs provided for bulk status update");
    return;
  }

  try {
    await prisma.job.updateMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      data: {
        status: update.status,
      },
    });

    logger.info(`Updated status to ${update.status} for ${jobIds.length} jobs`);
  } catch (error) {
    logger.error("Failed to update status for multiple jobs:", error);
    throw error;
  }
};
