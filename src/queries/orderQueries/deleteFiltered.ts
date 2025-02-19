import prisma from "../../services/prisma";
import { FilteredOrders } from "../../types/orderApi";
import logger from "../../utils/logger";

export async function deleteFiltered(where: FilteredOrders['filters'], batchSize = 50) {
    try {
        const batchToDelete = await prisma.order.findMany({
            where: where,
            take: batchSize,
            select: { id: true }
        });

        const batchJobIds = await prisma.job.findMany({
            where: {
                orderId: {
                    in: batchToDelete.map(order => order.id)
                }
            },
            select: { id: true }
        });

        const deleted = await prisma.order.deleteMany({
            where: {
                id: {
                    in: batchToDelete.map(order => order.id)
                }
            }
        });

        return {
            success: true,
            deletedOrders: deleted.count,
            jobIds: batchJobIds.map(job => job.id)
        };
    } catch (error) {
        logger.error('Batch deletion failed', error);
        return {
            success: false,
            error: `Failed to delete orders ${error}`,
            jobIds: []
        };
    }
}