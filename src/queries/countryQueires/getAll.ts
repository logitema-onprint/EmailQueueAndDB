import prisma from '../../services/prisma';
export async function getAll() {
    try {
        const products = await prisma.country.findMany()
        return {
            success: true,
            message: 'Successfully found all countries',
            data: products
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to get countries ${error}`
        }
    }
}