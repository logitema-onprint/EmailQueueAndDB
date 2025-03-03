import { RequestHandler, Request, Response } from "express";
import logger from "../../utils/logger";
import { countryQueries } from "../../queries/countryQueires";

export const getAllCountries: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await countryQueries.getAll();

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Failed to retrieve countries",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Failed to get countries agents", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve countries agents",
    });
  }
};
