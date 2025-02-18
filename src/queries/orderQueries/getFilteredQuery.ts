import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export async function getFilteredOrders(
  filters: {
    searchTerm?: string;
    tagIds?: number[] | null; // Changed to array
    tagStatuses?: string[] | null;
    location?: {
      country: string;
      city: string | null;
    } | null;
    agent?: string | null;
    paymentMethod?: string | null;
    companyName?: string;
    product?: string | null;
    dateRange: {
      from: string | null;
      to: string | null;
    };
    priceRange?: { min: string; max: string };
    isNot?: boolean;
  },
  page: number = 1,
  pageSize: number = 25
) {
  try {
    const where: any = {};

    if (filters.searchTerm) {
      const orderId = parseInt(filters.searchTerm);
      if (!isNaN(orderId)) {
        where.id = filters.isNot ? { not: orderId } : orderId;
      } else {
        where.OR = [
          {
            userName: {
              contains: filters.searchTerm,
              mode: "insensitive",
              ...(filters.isNot && {
                not: { contains: filters.searchTerm, mode: "insensitive" },
              }),
            },
          },
          {
            userSurname: {
              contains: filters.searchTerm,
              mode: "insensitive",
              ...(filters.isNot && {
                not: { contains: filters.searchTerm, mode: "insensitive" },
              }),
            },
          },
        ];
      }
    }

    if (filters.companyName) {
      if (filters.isNot) {
        where.NOT = {
          companyName: {
            contains: filters.companyName,
          },
        };
      } else {
        where.companyName = {
          contains: filters.companyName,
          mode: "insensitive",
        };
      }
    }

    if (filters.location) {
      if (filters.location.country) {
        where.country = filters.isNot
          ? { not: filters.location.country }
          : filters.location.country;
      }
      if (filters.location.city) {
        where.city = filters.isNot
          ? { not: filters.location.city }
          : filters.location.city;
      }
    }

    if (filters.agent) {
      where.salesAgentId = filters.isNot
        ? { not: filters.agent }
        : filters.agent;
    }

    if (filters.product) {
      where.productName = filters.isNot
        ? { not: filters.product }
        : filters.product;
    }

    if (filters.paymentMethod) {
      where.paymentDetails = filters.isNot
        ? { not: filters.paymentMethod }
        : filters.paymentMethod;
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      where.createdAt = {};

      if (filters.dateRange.from) {
        where.createdAt.gte = new Date(
          `${filters.dateRange.from}T00:00:00.000Z`
        );
      }

      if (filters.dateRange.to) {
        where.createdAt.lte = new Date(`${filters.dateRange.to}T23:59:59.999Z`);
      }
    }
    if (filters.priceRange?.min || filters.priceRange?.max) {
      where.subTotal = {};
      if (filters.priceRange.min) {
        where.subTotal.gte = parseFloat(filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        where.subTotal.lte = parseFloat(filters.priceRange.max);
      }
    }

    if (filters.tagIds?.length || filters.tagStatuses?.length) {
      if (filters.isNot) {
        where.jobs = {
          none: {
            OR: [
              ...(filters.tagIds?.length
                ? [
                    {
                      tagId: { in: filters.tagIds },
                    },
                  ]
                : []),
              ...(filters.tagStatuses?.length
                ? [
                    {
                      status: { in: filters.tagStatuses },
                    },
                  ]
                : []),
            ],
          },
        };
      } else {
        where.jobs = {
          some: {
            OR: [
              ...(filters.tagIds?.length
                ? [
                    {
                      tagId: { in: filters.tagIds },
                    },
                  ]
                : []),
              ...(filters.tagStatuses?.length
                ? [
                    {
                      status: { in: filters.tagStatuses },
                    },
                  ]
                : []),
            ],
          },
        };
      }
    }

    const totalCount = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        jobs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      totalCount,
      data: orders,
    };
  } catch (error) {
    logger.error("Failed to fetch filtered orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}
