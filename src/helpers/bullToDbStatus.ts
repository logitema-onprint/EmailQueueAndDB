const bullToDbStatusMap = {
  active: "SENDING",
  completed: "SENT",
  failed: "FAILED",
  delayed: "QUEUED",
  waiting: "PENDING",
  paused: "PAUSED",
} as const;

type BullStatus = keyof typeof bullToDbStatusMap;
type DbStatus = (typeof bullToDbStatusMap)[BullStatus];

export function bullToDbStatus(bullStatus: BullStatus): DbStatus {
  return bullToDbStatusMap[bullStatus];
}
