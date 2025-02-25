import prisma from "../../services/prisma";
import { JobItem } from "../queuesQueries/createQuery";

export async function createQueueBulk(jobDataArray: JobItem[]) {
    try {

        const result = await prisma.job.createMany({
            data: jobDataArray.map(jobData => ({
                id: jobData.id,
                orderId: jobData?.orderId ?? undefined,
                tagId: jobData.tagId,
                tagName: jobData.tagName,
                status: jobData.status,
                attempts: 0,
                error: jobData.error,
                scheduledFor: jobData.scheduledFor as bigint,
                processedAt: jobData.processedAt,
                updatedAt: jobData.updatedAt,
            })),
            skipDuplicates: true,
        });

        return {
            success: true,
            data: result,
            count: result.count
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to create jobs in bulk: ${error}`
        };
    }
}