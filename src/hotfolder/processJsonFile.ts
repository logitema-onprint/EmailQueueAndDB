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
import { rulesQueries } from "../queries/rulesQueries";
import { orderQueries } from "../queries/orderQueries";
import { salesAgentQueries } from "../queries/salesAgentQueries";
import { SalesAgenData } from "../queries/salesAgentQueries/createQuery";
import { OrderData } from "../queries/orderQueries/createQuery";
import { QueueService } from "../services/queueService";
import { tagQueries } from "../queries/tagQueries";
import { serializeBigInt } from "../helpers/serializeBigInt";

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

    const custumerResponse = await customerQueries.createQuery(custumerData);

    logger.info("55/processJsonFile", custumerResponse.message);

    const saleAgentParts = jsonData.sales_agent_name.split(/,\s*tel\.\s*/);
    logger.info(saleAgentParts);

    const salesAgentData: SalesAgenData = {
      fullText: jsonData.sales_agent_name,
      name: saleAgentParts[0]?.trim() || undefined,
      phoneNumber: saleAgentParts[1]?.trim() || undefined,
    };

    const salesAgentResponse = await salesAgentQueries.createQuery(
      salesAgentData
    );
    logger.info(salesAgentResponse.message);
    if (!salesAgentResponse.salesAgentId) {
    }

    const prodductTitels = items.map((items: any) => items.products_title);
    const productIds = items.map((item: any) => item.product_id);

    const orderData: OrderData = {
      id: jsonData.orders_id,
      orderNumber: jsonData.order_number,
      customerId: jsonData.user_id,
      phoneNumber: jsonData.customer_details.customers_telephone,
      userName: jsonData.customer_details.customers_first_name,
      userSurname: jsonData.customer_details.customers_last_name,
      companyName:
        typeof jsonData.customer_details.customers_company === "string"
          ? jsonData.customer_details.customers_company
          : null,
      orderDate: jsonData.orders_date_finished,
      paymentStatus: jsonData.payment_status_title,
      totalAmount: jsonData.total_amount,
      productNames: prodductTitels,
      productIds: productIds,
      paymentMethodName: jsonData.payment_method_name,
      salesAgentId:
        salesAgentResponse.salesAgentId ?? salesAgentResponse.data?.id ?? 0,
      country: jsonData.billing_details.billing_country,
      city: jsonData.billing_details.billing_city,
    };

    const orderResponse = await orderQueries.createOrder(orderData);

    logger.info(orderResponse.error, orderResponse.success);

    const orderId = Number(jsonData.orders_id);

    const tagIds = (await rulesQueries.getRule(1)).data?.tags;

    const tagData = await Promise.all(
      (tagIds || []).map(async (tagId) => {
        const result = await tagQueries.getTag(tagId);
        return result.data;
      })
    );
    const validTagData = serializeBigInt(tagData);

    const createJobs = await QueueService.createQueues(orderId, validTagData);

    

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
