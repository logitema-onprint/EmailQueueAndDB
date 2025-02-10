import { Queue } from "bullmq";
import "../workers/emailWorker";

interface Step {
  stepId: string;
  status: "pending" | "completed";
  completedAt: string | null;
}

interface EmailJob {
  queueId: string;
  email: string;
  tag: string;
  currentStepId: string;
  currentStep: number;
  steps: Record<string, Step>;
}

export const EmailQueue = new Queue<EmailJob>("email-queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
});
