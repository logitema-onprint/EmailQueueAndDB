import prisma from "../../../services/prisma";
import logger from "../../../utils/logger";

export async function getFilteredOrders(
  filters: {
    searchTerm?: string;
    tagIds?: number[] | null;
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
  page?: number,
  pageSize?: number,
  buildWhere?: boolean
) {
  try {
    const where: any = {};

    if (filters.tagIds?.length && !filters.isNot) {
      const existingTags = await prisma.job.findMany({
        select: {
          tagId: true,
        },
        distinct: ["tagId"],
      });

      const existingTagIds = existingTags.map((tag) => tag.tagId);
      const invalidTagIds = filters.tagIds.filter(
        (id) => !existingTagIds.includes(id)
      );

      if (invalidTagIds.length > 0) {
        return {
          success: false,
          error: `Invalid tag IDs: ${invalidTagIds.join(", ")}`,
        };
      }
    }

    if (filters.searchTerm) {
      const orderId = parseInt(filters.searchTerm);
      if (!isNaN(orderId)) {
        // Handle numeric search as order ID
        where.id = filters.isNot ? { not: orderId } : orderId;
      } else {
        // Split search term into words for more flexible searching
        const searchTerms = filters.searchTerm.trim().split(/\s+/);

        if (searchTerms.length === 1) {
          // Single word search (partial match on either userName or userSurname)
          if (filters.isNot) {
            where.AND = [
              {
                userName: {
                  not: { contains: searchTerms[0], mode: "insensitive" },
                },
              },
              {
                userSurname: {
                  not: { contains: searchTerms[0], mode: "insensitive" },
                },
              },
            ];
          } else {
            where.OR = [
              {
                userName: {
                  contains: searchTerms[0],
                  mode: "insensitive",
                },
              },
              {
                userSurname: {
                  contains: searchTerms[0],
                  mode: "insensitive",
                },
              },
            ];
          }
        } else {

          if (filters.isNot) {

            where.AND = [
              {
                OR: [
                  {
                    AND: searchTerms.map(term => ({
                      userName: {
                        not: { contains: term, mode: "insensitive" }
                      }
                    }))
                  },
                  {
                    AND: searchTerms.map(term => ({
                      userSurname: {
                        not: { contains: term, mode: "insensitive" }
                      }
                    }))
                  }
                ]
              }
            ];
          } else {
            if (searchTerms.length === 2) {
              where.OR = [
                {
                  AND: [
                    {
                      userName: {
                        equals: searchTerms[0],
                        mode: "insensitive",
                      }
                    },
                    {
                      userSurname: {
                        equals: searchTerms[1],
                        mode: "insensitive",
                      }
                    }
                  ]
                },
                {
                  AND: [
                    {
                      userName: {
                        contains: searchTerms[0],
                        mode: "insensitive",
                      }
                    },
                    {
                      userSurname: {
                        contains: searchTerms[1],
                        mode: "insensitive",
                      }
                    }
                  ]
                }
              ];
            } else {
              where.OR = [
                {
                  AND: [
                    {
                      userName: {
                        contains: searchTerms[0],
                        mode: "insensitive",
                      }
                    },
                    {
                      userSurname: {
                        contains: searchTerms[searchTerms.length - 1],
                        mode: "insensitive",
                      }
                    }
                  ]
                },
                ...searchTerms.map(term => ({
                  userName: {
                    contains: term,
                    mode: "insensitive",
                  }
                })),
                ...searchTerms.map(term => ({
                  userSurname: {
                    contains: term,
                    mode: "insensitive",
                  }
                })),
                {
                  OR: [
                    {
                      userName: {
                        contains: filters.searchTerm,
                        mode: "insensitive",
                      }
                    },
                    {
                      userSurname: {
                        contains: filters.searchTerm,
                        mode: "insensitive",
                      }
                    }
                  ]
                }
              ];
            }
          }
        }
      }
    }
    if (filters.companyName) {
      if (filters.isNot) {
        where.companyName = {
          not: { contains: filters.companyName, mode: "insensitive" },
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
      if (filters.isNot) {
        where.OR = [
          {
            createdAt: {
              lt: filters.dateRange.from
                ? new Date(`${filters.dateRange.from}T00:00:00.000Z`)
                : undefined,
            },
          },
          {
            createdAt: {
              gt: filters.dateRange.to
                ? new Date(`${filters.dateRange.to}T23:59:59.999Z`)
                : undefined,
            },
          },
        ].filter(
          (condition) =>
            condition.createdAt.lt !== undefined ||
            condition.createdAt.gt !== undefined
        );
      } else {
        where.createdAt = {};
        if (filters.dateRange.from) {
          where.createdAt.gte = new Date(
            `${filters.dateRange.from}T00:00:00.000Z`
          );
        }
        if (filters.dateRange.to) {
          where.createdAt.lte = new Date(
            `${filters.dateRange.to}T23:59:59.999Z`
          );
        }
      }
    }

    if (filters.priceRange?.min || filters.priceRange?.max) {
      if (filters.isNot) {
        where.OR = [
          {
            subTotal: {
              lt: filters.priceRange.min
                ? parseFloat(filters.priceRange.min)
                : undefined,
            },
          },
          {
            subTotal: {
              gt: filters.priceRange.max
                ? parseFloat(filters.priceRange.max)
                : undefined,
            },
          },
        ].filter(
          (condition) =>
            condition.subTotal.lt !== undefined ||
            condition.subTotal.gt !== undefined
        );
      } else {
        where.subTotal = {};
        if (filters.priceRange.min) {
          where.subTotal.gte = parseFloat(filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          where.subTotal.lte = parseFloat(filters.priceRange.max);
        }
      }
    }

    if (filters.tagIds?.length || filters.tagStatuses?.length) {
      if (filters.isNot) {
        where.jobs = {
          none: {
            AND: [
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
            AND: [
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
    logger.info(totalCount);
    if (buildWhere) {
      return {
        success: true,
        totalCount,
        where,
      };
    }

    if (totalCount === 0) {
      return {
        success: false,
        totalCount,
        data: [],
      };
    }

    page = Math.max(1, page || 1);
    pageSize = Math.max(1, Math.min(100, pageSize || 100));

    const orders = await prisma.order.findMany({
      where,
      include: {
        jobs: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
