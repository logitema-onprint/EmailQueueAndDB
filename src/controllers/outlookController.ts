import { Request, Response } from 'express';
import logger from '../utils/logger';


/**
 * Controller to handle incoming emails from Outlook forwarding
 */
export const receiveEmailWebhook = async (req: Request, res: Response) => {
    try {
        // Log the received email
        logger.info('Email received via webhook');

        // The email content will be in the request body
        const emailData = req.body;

        // Log the email subject and sender for debugging
        if (emailData && emailData.subject) {
            logger.info(`Email subject: ${emailData.subject}`);

            if (emailData.from && emailData.from.emailAddress) {
                logger.info(`From: ${emailData.from.emailAddress.address}`);
            }
        }

        // Process the email (store in database, trigger business logic, etc.)
        await processEmail(emailData);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Email received and processed successfully'
        });
    } catch (error) {
        logger.error('Error processing received email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process email'
        });
    }
};

/**
 * Process the received email
 * Implement your business logic here
 */
async function processEmail(emailData: any) {
    // Example implementation:

    // 1. Extract relevant information
    const {
        subject,
        bodyPreview,
        body,
        from,
        toRecipients,
        ccRecipients,
        receivedDateTime,
        hasAttachments,
        attachments
    } = emailData;

    // 2. Store in database
    // Example: await emailRepository.saveEmail({ subject, from, receivedDateTime, body });

    // 3. Process based on content/subject
    if (subject?.includes('urgent') || subject?.includes('important')) {
        // Example: await notificationService.sendUrgentNotification(emailData);
        logger.info('Urgent email detected, special handling initiated');
    }

    // 4. Handle attachments if present
    if (hasAttachments && attachments?.length > 0) {
        // Example: await attachmentService.processAttachments(attachments);
        logger.info(`Processing ${attachments.length} attachments`);
    }

    // 5. Respond to sender if needed
    // Example: await emailService.sendAutoReply(from.emailAddress.address, `Re: ${subject}`);

    // Log completion
    logger.info(`Email processed: ${subject}`);
}