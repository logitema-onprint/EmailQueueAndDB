import prisma from "../../services/prisma";
import { FilteredOrders } from "../../types/orderApi";
import logger from "../../utils/logger";
import { getFilteredOrders } from "./getFilteredQuery";



export async function deleteFiltered(filter: FilteredOrders['filters']) {
    try {
        const whereResult = await getFilteredOrders(
            filter,
            undefined,
            undefined,
            true
        );

        if (!whereResult.success || !whereResult.where) {
            return {
                success: false,
                error: whereResult.error || "Failed to build where clause",
                jobIds: []
            };
        }

        // Find job IDs for queue cleanup
        const jobsToDelete = await prisma.job.findMany({
            where: {
                order: whereResult.where
            },
            select: {
                id: true
            }
        });

        // Delete orders using the same where clause
        const deleted = await prisma.order.deleteMany({
            where: whereResult.where
        });

        return {
            success: true,
            deletedOrders: deleted.count,
            jobIds: jobsToDelete.map(job => job.id)
        };
    } catch (error) {
        logger.error("Failed to delete filtered orders:", error);
        return {
            success: false,
            error: "Failed to delete orders",
            jobIds: []
        };
    }


}