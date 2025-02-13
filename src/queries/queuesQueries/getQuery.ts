import prisma from "../../services/prisma";

export async function getQuery(jobId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    return {
      success: true,
      item: job
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get job: ${error}`
    };
  }
}