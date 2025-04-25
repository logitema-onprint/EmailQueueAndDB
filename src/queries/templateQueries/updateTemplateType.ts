import { Template } from '@prisma/client';
import prisma from '../../services/prisma';

export async function updateTemplateType(id: Template['id'], type: string) {
    try {
        const updateTemplateType = await prisma.template.update({
            where: {
                id: id
            },
            data: {
                type: type
            }
        })

        if (!updateTemplateType) {
            return {
                success: false,
                message: "Failed to update template type"
            }
        }
        return {
            success: true,
            message: "Template type updated successfully",
            updatedTemplateType: updateTemplateType
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to update template type: ${error}`
        }
    }
}