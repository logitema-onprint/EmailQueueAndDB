import prisma from "../../../services/prisma";
import logger from "../../../utils/logger";


export async function resumeOrderJobs(orderIds: number[]) {
    try {
        const updatedJobs = await prisma.job.updateMany({
            where: {
                orderId: {
                    in: orderIds
                },
                status: 'PAUSED'
            },
            data: {
                status: 'QUEUED',
                updatedAt: new Date()
            }
        });

        return {
            success: true,
            count: updatedJobs.count
        };
    } catch (error) {
        logger.error("Failed to pause jobs", error);
        return {
            success: false,
            error: `Failed to pause jobs: ${error}`
        };
    }
}