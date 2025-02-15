import { RequestHandler, Request, Response } from "express";
// import { BullMQServices } from "../../services/bullmqService";
import { tagQueries } from "../../queries/tagQueries";
import { v4 as uuidv4 } from "uuid";
import { Order } from "../../types/orderApi";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";

interface OrderData {
  phoneNumber: string;
  userName: string;
  userSurname: string;
  companyName: string;
  paymentDetails: string;
  subTotal: number;
  salesAgentId: string;
  country: string;
  city: string;
}

export const createOrder: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const orderData: OrderData = req.body;
    if (
      !orderData.country ||
      !orderData.salesAgentId ||
      !orderData.subTotal ||
      !orderData.userName ||
      !orderData.paymentDetails
    ) {
      res.status(400).json({
        success: false,
        message: "Mising required fields",
      });
    }

    const timestamp = new Date().toISOString();

    const clientId = uuidv4();
    const order: Order = {
      PK: `CLIENT#${clientId}`,
      SK: `ORDER#${orderData}`,
      orderId: uuidv4(),
      phoneNumber: orderData.phoneNumber,
      userName: orderData.userName,
      userSurname: orderData.userSurname,
      companyName: orderData.companyName,
      paymentDetails: orderData.paymentDetails,
      agentTagStatusKeys: [
        `${orderData.salesAgentId}#${tag1.item?.id}#pending`,
        `${orderData.salesAgentId}#${tag2.item?.id}#pending`,
        `${orderData.salesAgentId}#${tag3.item?.id}#pending`,
      ],

      subTotal: orderData.subTotal,
      salesAgentId: orderData.salesAgentId,
      country: orderData.country,
      updatedAt: timestamp,
      createdAt: timestamp,
      city: orderData.city,
      tags: tags,
    };
    const [result] = await Promise.all([
      orderQueries.create(order),
      // BullMQServices.createJobs("eduardas2000@mail.ru", tags),
    ]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
      logger.info(result.error);
      return;
    }
    res.status(200).json({
      success: true,
      message: "Created order and jobs by tag",
      tagIds: tags.map((tag) => tag.tagName),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed have fun",
    });
  }
};
