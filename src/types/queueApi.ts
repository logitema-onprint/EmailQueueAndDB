export interface QueueItem {
  jobId: string;
  tag: string;
  email: string;
  status: string;
  attempts: number;
  payload: object;
  error?: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor: number;
  processedAt?: number;
}
