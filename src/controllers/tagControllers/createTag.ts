import { error } from "console";
import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";
import { tagData } from "../../queries/tagQueries/createQuery";
import logger from "../../utils/logger";

export const createTag: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { tagName, scheduledFor, tagType } = req.body;
    console.log("1. Raw values:", {
      tagName,
      scheduledFor,
      type: typeof scheduledFor,
    });

    if (!tagName || scheduledFor === undefined || !tagType) {
      res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    const bigIntValue = BigInt(scheduledFor);
    console.log("2. Converted BigInt:", bigIntValue);

    const tagData: tagData = {
      tagName,
      scheduledFor: bigIntValue,
      tagType,
    };
    console.log("3. Final tagData:", tagData);

    const response = await tagQueries.create(tagData);
    console.log("4. Query response:", response);

    if (response?.error) {
      res.status(400).json({
        success: false,
        message: response.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Tag created",
    });
  } catch (error) {
    console.log("5. Error caught:", error);
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
