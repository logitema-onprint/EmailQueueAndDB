import prisma from '../../services/prisma';


export async function getAllTemplates() {
    try {
        const templates = await prisma.template.findMany()

        return {
            success: true,
            data: templates,
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to get templates ${error}`
        }
    }
}