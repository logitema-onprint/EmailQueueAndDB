// import { Request, RequestHandler, Response } from "express";
// import logger from "../../utils/logger";
// import { QueueService } from "../../services/queueService";
// import { RevalidateService } from "../../services/revalidateNext";

// export const deleteManyQueues: RequestHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { jobIds } = req.body;

//     console.log(jobIds);

//     if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
//       res.status(400).json({
//         success: false,
//         message: "Missing or invalid jobIds array",
//       });
//       return;
//     }

//     const queueJobResults = [];
//     for (const jobId of jobIds) {
//       try {
//         const job = await QueueService.getJobFromQueues(jobId);
//         queueJobResults.push({ jobId, job });
//       } catch (error) {
//         logger.warn(`Failed to get job ${jobId} from queue`, error);
//         queueJobResults.push({ jobId, job: null });
//       }
//     }

//     const bullResults = [];
//     for (const { jobId, job } of queueJobResults) {
//       if (job && job.job) {
//         try {
//           await job.job.remove();
//           bullResults.push({ jobId, success: true });
//         } catch (error) {
//           logger.warn(`Failed to remove job ${jobId} from Bull queue`, error);
//           bullResults.push({ jobId, success: false });
//         }
//       }
//     }

//     const dynamoResult = await batchQueuesQueries.deleteManyQuery(jobIds);

//     const failedBullDeletions = bullResults
//       .filter((result) => !result.success)
//       .map((result) => result.jobId);

//     if (!dynamoResult.success || failedBullDeletions.length > 0) {
//       await RevalidateService.revalidateQueue();
//       const errorMessage = [
//         !dynamoResult.success ? "Failed to remove some jobs from DynamoDB" : "",
//         failedBullDeletions.length > 0
//           ? `Failed to remove jobs ${failedBullDeletions.join(
//               ", "
//             )} from Bull queue`
//           : "",
//       ]
//         .filter(Boolean)
//         .join(". ");

//       res.status(207).json({
//         success: false,
//         message: "Partial success in removing jobs",
//         error: errorMessage,
//         failedBullDeletions,
//         dynamoDbError: dynamoResult.error,
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "All jobs successfully removed",
//     });
//   } catch (error) {
//     logger.error("Failed to remove jobs", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to remove jobs",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
