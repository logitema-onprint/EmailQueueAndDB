interface AccountedOrderParams {
  orders_id: string;
  order_number: string;
  user_id: string;
  airway_bill_number: string;
  payment_method_name: string;
  total_amount: string;
  order_amount: string;
  shipping_amount: string;
  tax_amount: string;
  po_number: string;
  transactionid: string;
  invoice_number: string;
  invoice_date: string;
  payment_status_title: string;
  delivery_name: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_country: string;
  billing_name: string;
  billing_city: string;
  billing_postcode: string;
  billing_country: string;
  billing_company: string;
  billing_extrafield: string;
  coupon_amount: string;
}

export class AccountedOrder {
  constructor(private readonly details: AccountedOrderParams) {}
}
