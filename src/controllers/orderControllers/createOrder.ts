import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../queries/orderQueries";
import logger from "../../utils/logger";
import { rulesQueries } from "../../queries/rulesQueries";
import { QueueService } from "../../services/queueService";

export interface OrderData {
  phoneNumber: string;
  userName: string;
  userSurname?: string;
  companyName?: string;
  paymentDetails: string;
  subTotal: number;
  salesAgentId: string;
  country: string;
  city: string;
  customerId: string;
  productName: string;
  productId: number;
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
      !orderData.paymentDetails ||
      !orderData.phoneNumber ||
      !orderData.city ||
      !orderData.customerId ||
      !orderData.productId ||
      !orderData.subTotal ||
      !orderData.userName
    ) {
      res.status(400).json({
        success: false,
        message: "Mising required fields",
      });
    }

    const tags = await rulesQueries.findRuleTagsByProductId(
      orderData.productId
    );

    if (!tags.success) {
      res.status(400).json({
        success: false,
        error: tags.error,
        message: tags.message,
      });
      return;
    }

    const order = await orderQueries.createOrder(orderData);

    if (!tags.data?.tags) {
      res.status(400).json({
        success: false,
        message: "Tags not found",
      });
      return;
    }

    const jobs = await QueueService.createQueues(
      order.data?.id,
      tags.data.tags
    );

    if (!jobs.success) {
      res.status(400).json({
        success: false,
        message: jobs.message,
        error: jobs.error,
      });
    }
    if (!order.success) {
      res.status(400).json({
        success: false,
        message: order.error,
      });
      logger.info(order.error);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Created order and jobs by tag",
      tagIds: tags.data.tags.map((tagId) => tagId.id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed have fun",
    });
  }
};
