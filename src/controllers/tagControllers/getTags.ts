import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";

export const getAllTags: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const query = await tagQueries.getAllTags();

    if (query.error) {
      res.status(400).json({
        success: false,
        message: `${query.error}`,
      });
    }

    res.status(200).json({
      success: true,
      tagIds: query.data?.map((id) => id.id),
      data: query.data,
    });
  } catch (error) {
    res.status(500).json({
      error: `Server error ${error}`,
    });
  }
};
