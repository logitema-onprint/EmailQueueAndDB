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
  ): Promise<void> {
    try {
      const sendEmail = await this.resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: subject,
        html: Array.isArray(html) ? html.join("") : html,
      });

      console.log("Email sent successfully:", sendEmail);
      console.log("Response ID:", sendEmail.data?.id);
      console.log("Status:", sendEmail.error?.message);
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw error;
    }
  }
}
