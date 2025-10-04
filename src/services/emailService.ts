import config from "../config";
import logger from "../utils/logger";
import { Resend } from "resend";

export class EmailService {
  private static resend = new Resend(config.resend.apiKey);
  private static readonly fromEmail = `noreply@${config.resend.emailDomain}`;

  static async sendEmail(
    to: string,
    subject: string,
    html: string[] | string
  ): Promise<{ sucess: boolean; message?: string }> {
    try {
      const sendEmail = await this.resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: subject,
        html: Array.isArray(html) ? html.join("") : html,
      });

      if (sendEmail.error?.message) {
        logger.error(
          `Error sending email:${sendEmail.error.name} : ${sendEmail.error.message} `
        );
        return {
          sucess: false,
        };
      }

      if (sendEmail.data?.id) {
        logger.success(`Email sent to ${to} with subject "${subject}"`);
      }
      return {
        sucess: true,
        message: "Email sent successfully",
      }
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw error;
    }
  }
}
