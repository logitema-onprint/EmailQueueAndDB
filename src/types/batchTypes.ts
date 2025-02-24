export interface BatchProgress {
  current: number;
  total: number;
  percent: number;
}

export interface BatchMetrics {
  totalTime: number;
  batchTimes: number[];
  averageBatchTime: number;
}

export interface BatchCommonState {
  startTime: number;
  batchTimes: number[];
  totalProcessedOrders: number;
  lastProcessedId: number;
  failedOrders: { orderId: number; error: string }[];
  totalBatches: number;
}

export interface BatchResult {
  success: boolean;
  totalDeletedOrders?: number;
  totalProcessedOrders?: number;
  totalJobsRemoved: number;
  totalJobsFound?: number;
  totalJobsProcessed?: number;
  totalTime: number;
  batchTimes: number[];
  failedOrders?: Array<{ orderId: number; error: string }>;
  averageBatchTime: number;
}

export interface BatchTagResult {
  success: boolean;
  totalProcessedOrders: number;
  totalJobsCreated?: number;
  totalTime: number;
  batchTimes: number[];
  averageBatchTime: number;
  failedOrders: Array<{ orderId: number; error: string }>;
}

export interface BatchPauseResumeResult extends BatchTagResult {
  totalJobsFound: number;
  totalJobsProcessed: number;
  totalJobsPaused?: number;
  totalJobsResumed?: number;
  totalJobsRemoved?: number;
}

export interface Tags {
  id: number;
  tagName: string;
  scheduledFor: bigint;
}
