import { RequestHandler, Request, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";
import { serializeBigInt } from "../../helpers/serializeBigInt";
import { Tag } from "@prisma/client";

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

    // Transform the data to handle BigInt values
    const transformedData = serializeBigInt(query.data);

    res.status(200).json({
      success: true,
      tagIds: transformedData?.map((tag: Tag) => tag.id),
      data: transformedData,
    });
  } catch (error) {
    res.status(500).json({
      error: `Server error ${error}`,
    });
  }
};
