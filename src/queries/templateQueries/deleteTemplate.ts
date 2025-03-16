import { Template } from "@prisma/client";
import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function deleteTemplate(id: Template["id"]) {
  try {
    const deletedItem = await prisma.template.delete({
      where: { id: id },
    });
    logger.success("Tempalte deleted");
    return {
      success: true,
      message: `Template ${deletedItem.templateName} delete`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete ${error}`,
    };
  }
}
