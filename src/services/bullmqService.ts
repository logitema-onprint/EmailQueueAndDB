import { v4 as uuidv4 } from "uuid";
import { EmailQueue } from "../queues/emailQueue";
import { queuesQueries } from "../queries/queuesQueries";
import { tagQueries } from "../queries/tagQueries";
import { QueueItem } from "../types/queueApi";
import logger from "../utils/logger";
import { RevalidateService } from "../services/revalidateNext";
import { log } from "console";

interface QueueTag {
    tagId: string;
    tagName: string;
    waitDuration: number;
}

interface CreateQueueResult {
    queueId: string;
    jobId: string;
    tag: string;
}

export class BullMQServices {
    static async createJobs(email: string, tags: QueueTag[]): Promise<{
        success: boolean;
        message: string;
        data?: CreateQueueResult[];
        error?: string;
    }> {
        try {
            if (!email || !tags || tags.length === 0) {
                return {
                    success: false,
                    message: "Missing required fields",
                };
            }

            const timestamp = new Date().toISOString();
            const createdJobs: CreateQueueResult[] = [];

            for (const tag of tags) {
                const jobId = uuidv4();

                try {
                    // Create Bull job
                    const job = await EmailQueue.add(
                        "email-job",
                        {
                            queueId: jobId,
                            email,
                            tagName: tag.tagName,
                            tagId: tag.tagId,
                        },
                        {
                            jobId,
                            delay: tag.waitDuration,
                            attempts: 3,
                        }
                    );

                    // Prepare queue item for database
                    const queueItem: QueueItem = {
                        jobId,
                        tagId: tag.tagId,
                        tagName: tag.tagName,
                        email,
                        status: "QUEUED",
                        attempts: 3,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                        scheduledFor: tag.waitDuration,
                        processedAt: undefined,
                        error: undefined,
                    };

                    const result = await queuesQueries.createQueue(queueItem);
                    await tagQueries.updateTagJobCountQuery(tag.tagId, "increment");
                    logger.success(`Added ${tag.tagName} to queue `)

                    if (result.error) {
                        await job.remove();
                        throw new Error(`Failed to create queue for tag ${tag.tagName}: ${result.error}`);
                    }

                    createdJobs.push({
                        queueId: jobId,
                        jobId: job.id || "",
                        tag: tag.tagName,
                    });
                } catch (error) {
                    logger.error(`Failed to create job for tag ${tag.tagName}`, error);
                    // Continue with other tags instead of failing completely
                }
            }

            if (createdJobs.length === 0) {
                return {
                    success: false,
                    message: "Failed to create any queue jobs",
                    error: "All job creation attempts failed",
                };
            }
            logger.success(`Created jobs : ${createdJobs.length}`)

            // await RevalidateService.revalidateTag();

            return {
                success: true,
                message: `Successfully created ${createdJobs.length} queue jobs`,
                data: createdJobs,
            };
        } catch (error) {
            logger.error("Failed to create queues", error);
            return {
                success: false,
                message: "Failed to create queues",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}