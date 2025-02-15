import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";


export const deleteTag: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tagId = Number(req.params.tagId);

    if (!tagId || isNaN(tagId)) {
      res.status(400).json({
        error: true,
        message: "Invalid or missing tag ID",
      });
      return;
    }

    const response = await tagQueries.deleteTag(tagId);

    if (response.error) {
      res.status(400).json({
        success: false,
        message: `${response.error}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error ${error}`,
    });
  }
};
