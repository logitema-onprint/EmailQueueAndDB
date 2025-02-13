export interface Order {
  PK: string;
  SK: string;
  orderId: string;
  phoneNumber: string;
  userName: string;
  userSurname: string;
  companyName: string;
  paymentDetails: string;
  subTotal: number;
  salesAgentId: string;
  country: string;
  city: string;
  agentTagStatusKeys: string[],
  createdAt: string;
  updatedAt: string;
  tags: {
    tagId: string;
    tagName: string;
    completedAt: null | string;
  }[];
}
