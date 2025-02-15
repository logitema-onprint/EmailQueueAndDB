import prisma from "../../services/prisma";

export async function getAllTags() {
  try {
    const data = await prisma.tag.findMany();

    if (data.length === 0) {
      throw new Error(`No tags was found`);
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get all tags ${error}`,
    };
  }
}
