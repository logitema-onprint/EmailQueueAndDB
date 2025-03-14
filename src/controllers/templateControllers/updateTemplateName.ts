import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { templateQueries } from "../../queries/templateQueries";

export const updateTemplateName: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { templateName } = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Template ID is required'
            });
            return;
        }

        if (!templateName) {
            res.status(400).json({
                success: false,
                message: 'Template name is required'
            });
            return;
        }

        const updatedTemplate = await templateQueries.updateTemplate(id, { templateName });

        if (!updatedTemplate.success) {
            res.status(400).json({
                success: false,
                message: updatedTemplate.message
            });
            return;
        }

        logger.success(`Template ${id} name updated successfully`);
        res.status(200).json({
            success: true,
            message: 'Template name updated successfully',
            data: updatedTemplate.updatedTemplate,
        });
    } catch (error) {
        logger.error("Failed to update template name", error);

        res.status(500).json({
            success: false,
            message: "Failed to update template name",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};