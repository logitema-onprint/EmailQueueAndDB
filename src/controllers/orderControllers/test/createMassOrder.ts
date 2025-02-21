import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../../queries/orderQueries";
import { rulesQueries } from "../../../queries/rulesQueries";
import { QueueService } from "../../../services/queueService";
import logger from "../../../utils/logger";
import { OrderData } from "../createOrder";

export const createMassOrders: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const count = 10000;
        const batchSize = 300;
        const concurrency = 10;

        const baseOrder: OrderData = {
            phoneNumber: "123456789",
            userName: "John",
            paymentDetails: "Credit Card",
            subTotal: 99.99,
            salesAgentId: "agent123",
            country: "Lithuania",
            city: "Vilnius",
            customerId: "cust123",
            productName: "Business Cards",
            productId: 16,
            userSurname: "Doe",
            companyName: "TechCorp"
        };

        const startTime = Date.now();
        const results = [];
        let totalCreated = 0;

        for (let i = 0; i < count; i += batchSize * concurrency) {
            // Add a break condition
            if (totalCreated >= count) break;

            const batches = Array(Math.min(concurrency, Math.ceil((count - totalCreated) / batchSize))).fill(null).map((_, batchIndex) => {
                return Array(batchSize).fill(null).map((_, index) => {
                    const orderIndex = totalCreated + index;
                    if (orderIndex >= count) return undefined;
                    return {
                        ...baseOrder,
                        phoneNumber: `123456789-${orderIndex}`,
                        customerId: `cust123-${orderIndex}`,
                        userName: `John-${orderIndex}`
                    };
                }).filter((order): order is OrderData => order !== undefined);
            });

            const batchResults = await Promise.all(
                batches.map(async (batch) => {
                    return Promise.all(
                        batch.map(async (order) => {
                            try {
                                const orderResult = await orderQueries.createOrder(order);

                                if (!orderResult.success) {
                                    return {
                                        success: false,
                                        error: orderResult.error
                                    };
                                }

                                const tags = await rulesQueries.findRuleTagsByProductId(order.productId);

                                if (!tags.success || !tags.data?.tags) {
                                    return {
                                        success: false,
                                        error: tags.error || "No tags found"
                                    };
                                }

                                const jobs = await QueueService.createQueues(
                                    orderResult.data?.id,
                                    tags.data.tags
                                );

                                return {
                                    success: jobs.success,
                                    orderId: orderResult.data?.id,
                                    error: jobs.error
                                };
                            } catch (error) {
                                return {
                                    success: false,
                                    error: error instanceof Error ? error.message : "Unknown error"
                                };
                            }
                        })
                    );
                })
            );

            const flatResults = batchResults.flat();
            results.push(...flatResults);

            // Update total created, only counting successful orders
            totalCreated += flatResults.filter(r => r.success).length;

            // Immediate break if we've reached the target
            if (totalCreated >= count) break;
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        res.status(200).json({
            success: true,
            message: `Created ${totalCreated} orders`,
            totalTime: `${duration}ms`,
            averageTimePerOrder: `${duration / totalCreated}ms`,
            failedOrders: results.filter(r => !r.success).length,
            successfulOrders: totalCreated
        });

    } catch (error) {
        logger.error("Failed to create mass orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to create mass orders",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};