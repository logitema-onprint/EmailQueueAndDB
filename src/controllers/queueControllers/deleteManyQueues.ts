import { Request, RequestHandler, Response } from "express";
import logger from "../../utils/logger";
import { QueueService } from "../../services/queueService";
import { RevalidateService } from "../../services/revalidateNext";
import { tagQueries } from "../../queries/tagQueries";
import { queuesQueries } from "../../queries/queuesQueries";

export const deleteManyQueues: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { jobIds } = req.body;

        console.log(jobIds);

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            res.status(400).json({
                success: false,
                message: "Missing or invalid jobIds array",
            });
            return;
        }

        const queueJobResults = [];
        for (const jobId of jobIds) {
            try {
                const job = await QueueService.getJobFromQueues(jobId);
                queueJobResults.push({ jobId, job });
            } catch (error) {
                logger.warn(`Failed to get job ${jobId} from queue`, error);
                queueJobResults.push({ jobId, job: null });
            }
        }

        const bullResults = [];
        for (const { jobId, job } of queueJobResults) {
            if (job && job.job) {
                try {
                    const status = await job.job.getState()
                    await job.job.remove();
                    if (job.data?.tagId && status !== "completed") {
                        await tagQueries.updateTagCount(job.data?.tagId, 'decrement')
                    }

                    bullResults.push({ jobId, success: true });
                } catch (error) {
                    logger.warn(`Failed to remove job ${jobId} from Bull queue`, error);
                    bullResults.push({ jobId, success: false });
                }
            }
        }

        const deleteResult = await queuesQueries.deleteManyJobs({ jobIds: jobIds })

        res.status(200).json({
            success: true,
            message: "All jobs successfully removed",
            result: deleteResult
        });
    } catch (error) {
        logger.error("Failed to remove jobs", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove jobs",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
