import { fastifyIntegration } from "@sentry/node";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface ProductData {
  id: string;
  title: string;
  name: string;
}

export async function createQuery(productData: ProductData) {
  try {
    const oldProduct = await prisma.product.findUnique({
      where: {
        id: productData.id,
      },
    });

    if (oldProduct) {
      return {
        newProduct: false,
        success: true,
        product: oldProduct,
        message: "Product already exist",
      };
    }

    const newProduct = await prisma.product.create({
      data: {
        id: productData.id,
        productName: productData.name,
        productTitle: productData.title,
      },
    });

    return {
      newProduct: true,
      success: true,
      product: newProduct,
      message: "New product created",
    };
  } catch (error) {
    logger.warn(`Failed product:`, productData);
    return {
      success: false,
      message: `Failed to create product ${error}`,
    };
  }
}
