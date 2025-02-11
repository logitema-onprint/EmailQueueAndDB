export interface QueueItem {
  jobId: string;
  tag: string;
  email: string;
  status: string;
  attempts: number;
  currentStepId: string;
  steps: {};
  error?: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor: number;
  processedAt?: number;
}

export interface Step {
  stepId: string;
  status: "pending" | "completed";
  completedAt: string | null;
}
