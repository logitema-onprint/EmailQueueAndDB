export interface Order {
  orderId: string;
  orderNumber: string;

  totalAmount: number;

  paymentMethodName: string;

  phoneNumber: string;
  userName: string;
  userSurname: string | null;
  companyName: string | null;

  userId: string;
  salesAgentName: string;

  productName: string[];
  productId: string[];

  country: string;
  city: string;

  // Relationships would be defined in Prisma schema
  // jobs: Job[];
  // customer: Customer;
}
