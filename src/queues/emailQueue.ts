import { Queue } from "bullmq";
import "../workers/emailWorker";


interface EmailJob {
  queueId: string;
  tagId: string;
  tagName: string
  email?: string;
}

export const EmailQueue = new Queue<EmailJob>("email-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});
