import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { countryQueries } from "../../queries/countryQueires";
import { customerQueries } from "../../queries/customerQueries";
import { log } from "console";

export const getCustumerInfo: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.params;
    logger.warn(email);
    if (!email) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const result = await customerQueries.getCustomerInfo(email as string);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "No customer found",
      });
      return;
    }
    logger.success("Customer information retrieved successfully");

    logger.debug(result.customer?.fullName);
    res.status(200).json({
      success: true,
      data: result.customer,
    });
  } catch (error) {
    logger.error("Failed to get customer information", error);
    res.status(500).json({
      success: false,
      message: "Failed to get customer information",
    });
  }
};
