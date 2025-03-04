import fs from "fs";
import path from "path";
import log from "../utils/logger";
import logger from "../utils/logger";
import { customerQueries } from "../queries/customerQueries";
import { CustumerData } from "../queries/customerQueries/createQuery";
import { rulesQueries } from "../queries/rulesQueries";
import { orderQueries } from "../queries/orderQueries";
import { salesAgentQueries } from "../queries/salesAgentQueries";
import { SalesAgenData } from "../queries/salesAgentQueries/createQuery";
import { OrderData } from "../queries/orderQueries/createQuery";
import { QueueService } from "../services/queueService";
import { tagQueries } from "../queries/tagQueries";
import { serializeBigInt } from "../helpers/serializeBigInt";
import { productQueries } from "../queries/productQueries";
import { ProductData } from "../queries/productQueries/createProduct";
import { ProductMetrics } from "../queries/productQueries/updateProductMetrics";
import { countryQueries } from "../queries/countryQueires";
import { ProductOrderData } from "../queries/productOrder/createQuery";
import { productOrderQueries } from "../queries/productOrder";

export async function processJsonFile(filePath: string): Promise<boolean> {
  const fileName = path.basename(filePath);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);
    log.info(`Processing JSON data from file: ${fileName}`);

    let items;
    if (Array.isArray(jsonData.product_details.items)) {
      items = jsonData.product_details.items;
    } else {
      items = [jsonData.product_details.items];
    }

    const country = await countryQueries.createQuery(
      jsonData.billing_details.billing_country
    );

    logger.info(country.message);

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

    const customerResult = await customerQueries.createQuery(custumerData);
    logger.info(`Customer processed: ${customerResult.message}`);

    const saleAgentParts = jsonData.sales_agent_name.split(/,\s*tel\.\s*/);
    const salesAgentData: SalesAgenData = {
      fullText: jsonData.sales_agent_name,
      name: saleAgentParts[0]?.trim() || undefined,
      phoneNumber: saleAgentParts[1]?.trim() || undefined,
    };

    let salesAgentId = 0;
    try {
      const salesAgentResponse = await salesAgentQueries.createQuery(
        salesAgentData
      );
      logger.info(`Sales agent processed: ${salesAgentResponse.message}`);

      if (salesAgentResponse.salesAgentId) {
        salesAgentId = salesAgentResponse.salesAgentId;
      } else if (salesAgentResponse.data?.id) {
        salesAgentId = salesAgentResponse.data.id;
      } else {
        logger.warn("No sales agent ID returned, using default value 0");
      }
    } catch (error) {
      logger.error(`Error processing sales agent: ${error}`);
    }

    for (const item of items) {
      const productData: ProductData = {
        id: item.product_id,
        title: item.products_title,
        name: item.products_name === "{}" || typeof item.products_name === "object" ? "" : item.products_name,
      };

      try {
        const productResponse = await productQueries.createQuery(productData);
        logger.info(`Product processed: ${productResponse.message}`);
      } catch (error) {
        logger.error(
          `Failed to create/update product ${item.product_id}: ${error}`
        );
      }
    }

    const prodductTitels = items.map((item: any) => item.products_title);
    const productIds = items.map((item: any) => item.product_id);
    const orderId = Number(jsonData.orders_id);

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
      email: jsonData.customer_details.customers_email_address,
      isLast: true,
      productIds: productIds,
      paymentMethodName: jsonData.payment_method_name,
      salesAgentId: salesAgentId,
      country: jsonData.billing_details.billing_country,
      city: jsonData.billing_details.billing_city,
    };

    const isLastOrder = await orderQueries.getLastOrder(jsonData.user_id);

    const orderResponse = await orderQueries.createOrder(orderData);

    if (!orderResponse.createJobs) {
      logger.info("Moving jobs in paused queue");
      await QueueService.pauseOrders([Number(isLastOrder.orderId)]);
    }

    if (!orderResponse.orderExist && orderResponse.createJobs) {
      if (isLastOrder.isLast) {
        await QueueService.makeInactiveOrders([Number(isLastOrder.orderId)]);
        await orderQueries.updateOrderLastKey(Number(isLastOrder.orderId));
      }
      const tagIds = (await rulesQueries.getGlobalRule()).data?.tags || [];
      const tagData = await Promise.all(
        tagIds.map(async (tagId) => {
          const result = await tagQueries.getTag(tagId);
          return result.data;
        })
      );
      const validTagData = serializeBigInt(tagData);
      const createJobs = await QueueService.createQueues(orderId, validTagData);
      logger.info(
        `Created ${createJobs.totalJobsCreated} jobs for order ${orderId}`
      );

      if (salesAgentId) {
        await salesAgentQueries.updateJobCount(salesAgentId);
        logger.info(`Updated job count for sales agent ${salesAgentId}`);
      }

      const totalSpend = Number(parseFloat(jsonData.total_amount).toFixed(2));

      await customerQueries.updateCustomerMetrics(totalSpend, jsonData.user_id);

      for (const item of items) {
        const productOrderData: ProductOrderData = {
          orderId: Number(jsonData.orders_id),
          productId: item.product_id,
          salesAgentId: salesAgentId,
          salesAgentFullText: jsonData.sales_agent_name,
          totalAmount: Number(parseFloat(item.products_price).toFixed(2)),
          quaninty: parseInt(item.products_quantity),
          orderDate: jsonData.orders_date_finished,
          city: jsonData.billing_details.billing_city,
          country: jsonData.billing_details.billing_country,
        };
        try {
          const productOrder = await productOrderQueries.createQuery(
            productOrderData
          );
          logger.info(productOrder.message);
        } catch (error) {
          logger.warn(error);
        }
      }

      for (const item of items) {
        const productMetrics: ProductMetrics = {
          totalOrderedQuaninty: parseInt(item.products_quantity),
          totalOrderCount: 1,
          totalRevenue: Number(parseFloat(item.products_price).toFixed(2)),
        };

        try {
          await productQueries.updateProductMetrics(
            item.product_id,
            productMetrics
          );
          logger.info(`Updated metrics for product ${item.product_id}`);
        } catch (error) {
          logger.error(
            `Failed to update product metrics for product ${item.product_id}: ${error}`
          );
        }
      }

      logger.info(
        `Job creation summary: ${createJobs.totalJobsCreated} jobs created message: ${orderResponse.message}`
      );
    } else {
      logger.info(
        `Order ${orderId} processing stopped ${orderResponse.message}: ${orderResponse.error}`
      );
    }

    return true;
  } catch (error) {
    log.error(`Error processing JSON file ${fileName}: ${error}`);
    return false;
  }
}
