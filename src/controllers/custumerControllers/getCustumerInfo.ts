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
        errorType: "MISSING_FIELD",
        message: "Missing required fields",
      });
    }
    const result = await customerQueries.getCustomerInfo(email as string);

    if (!result.success) {
      res.status(404).json({
        success: false,
        message: "No customer found",
        errorType: "CUSTOMER_NOT_FOUND",
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
      errorType: "SERVER_ERROR",
      message: "Failed to get customer information",
    });
  }
};
