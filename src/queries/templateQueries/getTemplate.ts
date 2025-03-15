import { Template } from "@prisma/client";
import prisma from "../../services/prisma";

export async function getTemplate(id: Template["id"]) {
  try {
    const template = await prisma.template.findUnique({
      where: {
        id: id,
      },
    });

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get template ${error}`,
    };
  }
}
