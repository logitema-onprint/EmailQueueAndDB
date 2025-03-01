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
  };
  page: number;
  pageSize: number;
}
