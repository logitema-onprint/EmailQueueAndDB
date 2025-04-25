import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { templateQueries } from "../../queries/templateQueries";

export const updateTemplateType: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { templateType } = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Template ID is required",
            });
            return;
        }

        if (!templateType) {
            res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
            return;
        }


        const updatedTemplate = await templateQueries.updateTemplateType(
            Number(id),
            templateType
        );

        if (!updatedTemplate.success) {
            res.status(400).json({
                success: false,
                message: updatedTemplate.message,
            });
            return;
        }

        logger.success(`Template ${id} updated successfully`);
        res.status(200).json({
            success: true,
            message: "Template updated successfully",
            data: updatedTemplate.updatedTemplateType,
        });
    } catch (error) {
        logger.error("Failed to update template", error);

        res.status(500).json({
            success: false,
            message: "Failed to update template",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
