import { Queue } from "bullmq";
import "../workers/emailWorker";


export interface EmailJob {
  jobId: string;
  tagId: number;
  tagName: string
  email?: string;
}

export const EmailQueue = new Queue<EmailJob>("email-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});
