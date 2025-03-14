import prisma from '../../services/prisma';
import logger from '../../utils/logger';

export interface TemplateData {
    templateName: string,
    htmlUrl: string,
    jsonUrl: string
}

export async function createTemplate(templateData: TemplateData) {
    try {
        const template = await prisma.template.create({
            data: {
                templateName: templateData.templateName,
                htmlUrl: templateData.htmlUrl,
                jsonUrl: templateData.jsonUrl
            }
        })

        if (!template) {
            logger.error('Failed to create template')
        }
        return {
            success: true,
            message: 'Template created',
            template: template
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to create template ${error}`,
            error: error
        }
    }
}