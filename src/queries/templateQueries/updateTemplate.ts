import { Template } from "@prisma/client";
import prisma from "../../services/prisma";

export interface UpdateTemplateData {
    templateName?: Template['templateName'];
    jsonUrl?: Template['jsonUrl'];
    htmlUrl?: Template['htmlUrl'];
}

export async function updateTemplate(id: Template['id'], data: UpdateTemplateData) {
    try {
        const updatedTemplate = await prisma.template.update({
            where: { id },
            data
        });

        return {
            success: true,
            updatedTemplate,
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to update template: ${error}`
        };
    }
}