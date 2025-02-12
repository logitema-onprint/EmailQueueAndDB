

export interface Order {
    clientId: string;    // Exact key name as in DynamoDB
    orderDate: string;    // Exact key name as in DynamoDB
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
    createdAt: string;
    updatedAt: string;
    tags: {
        tagId: string;
        tagName: string;
        completedAt: null | string;
    }[];
}
