const bullToDynamoStatusMap = {
  active: "SENDING",
  completed: "SENT",
  failed: "FAILED",
  delayed: "PENDING",
  waiting: "QUEUED",
  paused: "PAUSED",
} as const;

type BullStatus = keyof typeof bullToDynamoStatusMap;
type DynamoStatus = (typeof bullToDynamoStatusMap)[BullStatus];

export function convertBullToDynamoStatus(bullStatus: BullStatus): DynamoStatus {
  return bullToDynamoStatusMap[bullStatus];
}
