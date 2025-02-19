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


export interface FilteredOrders {
  filters: {
    searchTerm?: string;
    tagIds?: number[] | null;
    tagStatuses?: string[] | null;
    location?: {
      country: string;
      city: string | null;
    } | null;
    agent?: string | null;
    paymentMethod?: string | null;
    companyName?: string;
    product?: string | null;
    dateRange: {
      from: string | null;
      to: string | null;
    };
    priceRange?: { min: string; max: string };
    isNot?: boolean;
  },
  page: number
  pageSize: number
}