import { Request, RequestHandler, Response } from "express";
import { tagQueries } from "../../queries/tagQueries";
import { TagService } from "../../services/tagService";
import logger from "../../utils/logger";

export const updateTagStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tagId = Number(req.params.tagId);
    const { isActive } = req.body;

    if (!tagId || isActive === undefined) {
      res.status(400).json({
        success: false,
        message: "Missing tag ID or status",
      });
    }

    const updateResult = await tagQueries.updateTagStatus(tagId, isActive);

    if (!updateResult.success) {
      res.status(400).json({
        success: false,
        message: updateResult.error,
      });
    }

    let queueActionResult;
    switch (isActive) {
      case true:
        queueActionResult = await TagService.resumeJobsByTags([tagId]);
        logger.info(`Tag ${tagId} activated and jobs resumed`, {
          successCount: queueActionResult.successCount,
          failureCount: queueActionResult.failureCount,
        });
        break;

      case false:
        queueActionResult = await TagService.pauseJobsByTags([tagId]);
        logger.info(`Tag ${tagId} deactivated and jobs paused`, {
          successCount: queueActionResult.successCount,
          failureCount: queueActionResult.failureCount,
        });
        break;

      default:
        throw new Error("Invalid isActive value");
    }

    res.status(200).json({
      success: true,
      message: `Tag ${tagId} status updated to ${
        isActive ? "active" : "inactive"
      }`,
      data: {
        tagUpdate: updateResult.data,
        queueAction: {
          successCount: queueActionResult.successCount,
          failureCount: queueActionResult.failureCount,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to update tag status", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tag status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
