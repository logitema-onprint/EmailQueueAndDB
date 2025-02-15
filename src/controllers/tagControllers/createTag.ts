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
    const { tagName, scheduledFor } = req.body;

    if (!tagName || !scheduledFor) {
      res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    const tagData: tagData = {
      tagName,
      scheduledFor,
    };

    const response = await tagQueries.create(tagData);

    if (response?.error) {
      res.status(400).json({
        success: false,
        message: `${response.error}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Tag created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
