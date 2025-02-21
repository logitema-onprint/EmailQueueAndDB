const bullToDbStatusMap = {
  active: "SENDING",
  completed: "SENT",
  failed: "FAILED",
  delayed: "QUEUED",
  waiting: "PENDING",
  paused: "PAUSED",
  inactive: "INACTIVE"
} as const;

type BullStatus = keyof typeof bullToDbStatusMap;
type DbStatus = (typeof bullToDbStatusMap)[BullStatus];

type CustomStatus = DbStatus | "INACTIVE";

type ExtendedJobStatus = BullStatus | "inactive";

export function bullToDbStatus(bullStatus: ExtendedJobStatus): CustomStatus {
  return bullToDbStatusMap[bullStatus];
}
