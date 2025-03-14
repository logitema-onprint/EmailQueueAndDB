// import { RequestHandler, Request, Response } from "express";
// import { graphClient } from "../services/graphApiService";
// import logger from "../utils/logger";
// import config from "../config";

// export const getFirstEmail: RequestHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const userId = "EduardasKuliesa@eduardaskuliesaa.onmicrosoft.com";

//     // Fetch first email for the specific user
//     const response = await graphClient
//       .api(`/users/${userId}/messages`)
//       .top(1)
//       .get();

//     // Log the operation
//     logger.info(`Retrieved first email for user ${userId}`);

//     if (response.value && response.value.length > 0) {
//       logger.success("Email retrieved successfully");
//       res.status(200).json({
//         success: true,
//         email: response.value[0],
//       });
//     } else {
//       logger.info("No emails found for user");
//       res.status(404).json({
//         success: false,
//         message: "No emails found",
//       });
//     }
//   } catch (error: any) {
//     // Log the error
//     logger.error(`Error retrieving first email: ${error.message}`);

//     // Send error response
//     res.status(500).json({
//       success: false,
//       message: `Server error retrieving email`,
//       error: error.message,
//     });
//   }
// };
