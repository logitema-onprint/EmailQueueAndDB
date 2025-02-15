import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";

export const getTag: RequestHandler = async (req: Request, res: Response) => {
  try {
    const tagId = Number(req.params.tagId);
    if (!tagId || isNaN(tagId)) {
      res.status(400).json({
        error: true,
        message: "Invalid or missing tag ID",
      });
    }

    const query = await tagQueries.getTag(tagId);
    if (query.error) {
      res.status(400).json({
        success: false,
        message: `${query.error}`,
      });
    }

    res.status(200).json({
      success: true,
      data: query.data,
    });
  } catch (error) {
    res.status(500).json({
      error: `Server error ${error}`,
    });
  }
};
