import fs from "fs";
import path from "path";
import log from "../utils/logger";
import logger from "../utils/logger";
import { AccountedOrder } from "./accountedOrder";
import { Order } from "../types/order";
import { Product } from "../types/product";

import { Country } from "../types/country";
import { customerQueries } from "../queries/customerQueries";
import { Customer } from "@prisma/client";
import { CustumerData } from "../queries/customerQueries/createQuery";

export async function processJsonFile(filePath: string): Promise<boolean> {
  const fileName = path.basename(filePath);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    log.info(`Processing JSON data from file: ${fileName}`);
    log.info(`JSON keys found: ${Object.keys(jsonData).join(", ")}`);

    let items;
    if (Array.isArray(jsonData.product_details.items)) {
      items = jsonData.product_details.items;
    } else {
      items = [jsonData.product_details.items];
    }

    const custumerData: CustumerData = {
      id: jsonData.user_id,
      fullName: jsonData.customer_details.customers_name,
      firstName: jsonData.customer_details.customers_first_name,
      lastName: jsonData.customer_details.customers_last_name,
      company:
        typeof jsonData.customer_details.customers_company === "string"
          ? jsonData.customer_details.customers_company
          : null,
      phoneNumber: jsonData.customer_details.customers_telephone,
      email: jsonData.customer_details.customers_email_address,
      registerDate: jsonData.customer_details.customers_register_date,
      rewardPoints:
        typeof jsonData.customer_details.reward_points === "string"
          ? jsonData.customer_details.reward_points
          : null,
      extrafields:
        typeof jsonData.customer_details.extrafield === "string"
          ? jsonData.customer_details.extrafield
          : null,
    };

    const custumerRes = await customerQueries.createQuery(custumerData);

    logger.info("55/processJsonFile", custumerRes.message);

    const prodductTitels = items.map((items: any) => items.products_title);
    const productIds = items.map((item: any) => item.product_id);

    const orderData: Order = {
      orderId: jsonData.orders_id,
      orderNumber: jsonData.order_number,
      userId: jsonData.user_id,
      phoneNumber: jsonData.customer_details.customers_telephone,
      userName: jsonData.customer_details.customers_first_name,
      userSurname: jsonData.customer_details.customers_last_name,
      companyName: jsonData.customer_details.customers_company,
      totalAmount: jsonData.total_amount,
      productName: prodductTitels,
      productId: productIds,
      paymentMethodName: jsonData.payment_method_name,
      salesAgentName: jsonData.sales_agent_name,
      country: jsonData.billing_details.billing_country,
      city: jsonData.billing_details.billing_city,
    };

    // logger.info(orderData);
    // const productsData: Product[] = items.map((item: any) => {
    //   const quantity = parseInt(item.products_quantity) || 0;
    //   const price = parseFloat(item.products_price) || 0;
    //   const totalBeforeTax = price;
    //   const taxRate = 0.21;
    //   const totalAfterTax = totalBeforeTax * (1 + taxRate);

    //   return {
    //     product_id: item.product_id,
    //     products_name: item.products_name,
    //     products_title: item.products_title,
    //     totalOrderedQuantity: quantity,
    //     totalOrderCount: 1,
    //     totalRevenueBeforeTax: totalBeforeTax,
    //     totalRevenueAfterTax: totalAfterTax,
    //   };
    // });

    // logger.info("Products data:", productsData);

    // const country: Country = {
    //   id: "12312",
    //   countryName: jsonData.billing_details.billing_country,
    //   totalOrders: 0,
    //   totalRevenue: 0,
    // };

    return true;
  } catch (error) {
    log.error(`Error processing JSON file ${fileName}: ${error}`);
    return false;
  }
}
