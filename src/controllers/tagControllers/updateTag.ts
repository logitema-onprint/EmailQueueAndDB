import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";

export const updateTag: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tagId = Number(req.params.tagId);

    const { tagName, scheduledFor } = req.body;

    if (!tagId || isNaN(tagId)) {
      res.status(400).json({
        error: true,
        message: "Invalid or missing tag ID",
      });
      return;
    }

    const tag = await tagQueries.getTag(tagId);

    if (tag.error) {
      res.status(404).json({
        success: false,
        message: `${tag.error}`,
      });
    }

    const updateTag = await tagQueries.updateTag(tagId, {
      tagName,
      scheduledFor,
    });

    if (updateTag.error) {
      res.status(400).json({
        success: false,
        message: `${updateTag.error}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
