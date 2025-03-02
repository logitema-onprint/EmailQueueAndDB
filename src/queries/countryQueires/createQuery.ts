import prisma from "../../services/prisma";

export async function createQuery(countryName: string) {
  try {
    const oldCountry = await prisma.country.findFirst({
      where: {
        countryName: countryName,
      },
    });
    if (oldCountry) {
      return {
        success: true,
        message: "Country already exist",
      };
    }

    const newCountry = await prisma.country.create({
      data: {
        countryName: countryName,
      },
    });

    return {
      success: true,
      message: `Created new country: ${newCountry.countryName} `,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create country ${error}`,
    };
  }
}
