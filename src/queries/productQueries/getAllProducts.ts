import prisma from '../../services/prisma';
export async function getAll() {
    try {
        const products = await prisma.product.findMany()
        return {
            success: true,
            message: 'Successfully found all products',
            data: products
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to get products ${error}`
        }
    }
}