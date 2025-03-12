import axios from 'axios';
import { ConfidentialClientApplication } from '@azure/msal-node';
import logger from '../utils/logger';

// Microsoft Graph authentication configuration
const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_APPLICATION_ID || "",
        clientSecret: "mh38Q~HbYejNjI5KFtzzu-DFhzUrsccEQE6_sczw",
        authority: "https://login.microsoftonline.com/dae32ec9-1380-46e4-bdd2-b18d76cb1ec0"
    }
};

// Create MSAL application
const msalClient = new ConfidentialClientApplication(msalConfig);

// Class to handle Outlook email operations
export class OutlookService {

    // Get access token for Microsoft Graph API
    private async getAccessToken() {
        try {
            const result = await msalClient.acquireTokenByClientCredential({
                scopes: ["https://graph.microsoft.com/.default"]
            });

            if (!result?.accessToken) {
                logger.error('Failed to get access token');
                throw new Error("No access token returned");
            }

            return result.accessToken;
        } catch (error) {
            logger.error("Failed to acquire token:", error);
            throw new Error("Authentication failed");
        }
    }

    // Get recent emails from a specific user's inbox
    async getRecentEmails(userEmail = 'eduardaskuliesaa.onmicrosoft.com') { // ← Replace with an admin email in your tenant
        try {
            const accessToken = await this.getAccessToken();

            // Make sure a user email is provided
            if (!userEmail) {
                throw new Error("User email must be specified");
            }

            const response = await axios.get(
                `https://graph.microsoft.com/v1.0/users/${userEmail}/mailFolders/inbox/messages?$top=10`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            return {
                success: true,
                data: response.data.value
            };
        } catch (error) {
            logger.error("Failed to get emails:", error);
            return {
                success: false,
                message: "Failed to retrieve emails",
                error: error
            };
        }
    }

    // Get emails received within the last X minutes
    async getNewEmails(minutes = 5, userEmail = 'eduardaskuliesaa.onmicrosoft.com') { // ← Replace with an admin email in your tenant
        try {
            const accessToken = await this.getAccessToken();

            // Make sure a user email is provided
            if (!userEmail) {
                throw new Error("User email must be specified");
            }

            // Calculate time X minutes ago
            const pastTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

            const response = await axios.get(
                `https://graph.microsoft.com/v1.0/users/${userEmail}/mailFolders/inbox/messages?$filter=receivedDateTime ge ${pastTime}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            return {
                success: true,
                data: response.data.value
            };
        } catch (error) {
            logger.error("Failed to get new emails:", error);
            return {
                success: false,
                message: "Failed to retrieve new emails",
                error: error
            };
        }
    }

    // Get a specific email by ID
    async getEmailById(emailId: string, userEmail = 'eduardaskuliesaa.onmicrosoft.com') { // ← Replace with an admin email in your tenant
        try {
            const accessToken = await this.getAccessToken();

            // Make sure a user email is provided
            if (!userEmail) {
                throw new Error("User email must be specified");
            }

            if (!emailId) {
                throw new Error("Email ID is required");
            }

            const response = await axios.get(
                `https://graph.microsoft.com/v1.0/users/${userEmail}/messages/${emailId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            logger.error(`Failed to get email ${emailId}:`, error);
            return {
                success: false,
                message: "Failed to retrieve email",
                error: error
            };
        }
    }

    // Send an email from a specific user
    async sendEmail(toEmail: any, subject: any, body: any, fromEmail = 'eduardaskuliesaa.onmicrosoft.com') { // ← Replace with an admin email in your tenant
        try {
            const accessToken = await this.getAccessToken();

            // Make sure sender email is provided
            if (!fromEmail) {
                throw new Error("Sender email must be specified");
            }

            const emailData = {
                message: {
                    subject: subject,
                    body: {
                        contentType: 'Text',
                        content: body
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: toEmail
                            }
                        }
                    ]
                },
                saveToSentItems: true
            };

            const response = await axios.post(
                `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
                emailData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: "Email sent successfully"
            };
        } catch (error) {
            logger.error("Failed to send email:", error);
            return {
                success: false,
                message: "Failed to send email",
                error: error
            };
        }
    }
}