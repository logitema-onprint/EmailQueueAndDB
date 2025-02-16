import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";
import { serializeBigInt } from "../../helpers/serializeBigInt";

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
    const serializedData = serializeBigInt(query.data);

    res.status(200).json({
      success: true,
      data: serializedData,
    });
  } catch (error) {
    res.status(500).json({
      error: `Server error ${error}`,
    });
  }
};
