export interface QueueItem {
  jobId: string;
  tagId: string;
  tagName: string
  email: string;
  status: string;
  attempts: number;
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
