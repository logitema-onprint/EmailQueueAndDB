import prisma from "../../services/prisma";

export async function getAllRules() {
  try {
    const data = await prisma.rule.findMany();

    if (data.length === 0) {
      throw new Error(`No rules was found`);
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get all rules ${error}`,
    };
  }
}
