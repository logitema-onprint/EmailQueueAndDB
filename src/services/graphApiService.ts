// import { Client } from "@microsoft/microsoft-graph-client";
// import { ClientSecretCredential } from "@azure/identity";
// import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
// import config from "../config";
// import logger from "../utils/logger";

// // Fix typo: tenat -> tenant
// const credential = new ClientSecretCredential(
//   config.microsoftGraphApi.tenat!,
//   config.microsoftGraphApi.client!,
//   config.microsoftGraphApi.secret!
// );

// // Create auth provider with the proper import
// const authProvider = new TokenCredentialAuthenticationProvider(credential, {
//   scopes: ["https://graph.microsoft.com/.default"],
// });

// // Initialize the Graph client with the auth provider
// export const graphClient = Client.initWithMiddleware({
//   authProvider: authProvider,
// });

// export async function getFirstEmailForUser(userId: string) {
//   try {
//     const response = await graphClient
//       .api(`/users/${userId}/messages`)
//       .top(1)
//       .get();

//     return response.value[0];
//   } catch (error) {
//     logger.error(`Error retrieving email for user ${userId}: ${error}`);
//     throw error;
//   }
// }
