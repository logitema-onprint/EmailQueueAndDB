import prisma from "../../services/prisma";

export async function getGlobalRule() {
  try {
    const globalRule = await prisma.rule.findFirst({
      where: {
        ruleType: "Global",
      },
    });

    return {
      success: true,
      message: "Found global rule",
      data: globalRule,
    };
  } catch (error) {
    return {
      success: true,
      message: `Failed to get global rule :${error}`,
    };
  }
}
