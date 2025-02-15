import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function deleteTag(tagId: number) {
  try {
    const res = await prisma.tag.delete({
      where: { id: tagId },
    });
    logger.success(`Tag with id: ${res.id} deleted`);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete tag ${error}`,
    };
  }
}
