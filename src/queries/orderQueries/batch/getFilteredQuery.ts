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
    products?: string[] | null;
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
    console.log(pageSize)
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

        where.id = filters.isNot ? { not: orderId } : orderId;
      } else {
        const searchTerms = filters.searchTerm.trim().split(/\s+/);

        if (searchTerms.length === 1) {
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
        if (filters.isNot) {
          where.city = {
            not: { contains: filters.location.city, mode: "insensitive" }
          };
        } else {
          where.city = {
            contains: filters.location.city,
            mode: "insensitive"
          };
        }
      }
    }

    if (filters.agent) {
      where.salesAgentId = filters.isNot
        ? { not: filters.agent }
        : filters.agent;
    }

    if (filters.products && filters.products.length > 0) {
      if (filters.isNot) {
        where.productNames = {
          none: {
            in: filters.products
          }
        };
      } else {
        where.productNames = {
          hasSome: filters.products
        };
      }
    }

    if (filters.paymentMethod) {
      where.paymentDetails = filters.isNot
        ? { not: filters.paymentMethod }
        : filters.paymentMethod;
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      logger.info("Original date range:", { from: filters.dateRange.from, to: filters.dateRange.to });

      if (filters.isNot) {
        const conditions = [];
        if (filters.dateRange.from) {
          conditions.push({
            orderDate: {
              lt: filters.dateRange.from,
            },
          });
        }
        if (filters.dateRange.to) {
          const adjustedTo = filters.dateRange.to.includes(" ")
            ? filters.dateRange.to
            : `${filters.dateRange.to} 23:59:59`;

          conditions.push({
            orderDate: {
              gt: adjustedTo,
            },
          });
        }
        if (conditions.length > 0) {
          where.OR = conditions;
        }
      } else {
        where.orderDate = {};

        if (filters.dateRange.from) {
          where.orderDate.gte = filters.dateRange.from;
        }

        if (filters.dateRange.to) {
          const adjustedTo = filters.dateRange.to.includes(" ")
            ? filters.dateRange.to
            : `${filters.dateRange.to} 23:59:59`;

          where.orderDate.lte = adjustedTo;
        }
      }
    }

    if (filters.priceRange?.min || filters.priceRange?.max) {
      if (filters.isNot) {
        where.OR = [
          {
            totalAmount: {
              lt: filters.priceRange.min
                ? parseFloat(filters.priceRange.min)
                : undefined,
            },
          },
          {
            totalAmount: {
              gt: filters.priceRange.max
                ? parseFloat(filters.priceRange.max)
                : undefined,
            },
          },
        ].filter(
          (condition) =>
            condition.totalAmount.lt !== undefined ||
            condition.totalAmount.gt !== undefined
        );
      } else {
        where.totalAmount = {};
        if (filters.priceRange.min) {
          where.totalAmount.gte = parseFloat(filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          where.totalAmount.lte = parseFloat(filters.priceRange.max);
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
    logger.info("Pagesize", pageSize)
    const orders = await prisma.order.findMany({
      where,
      include: {
        jobs: true,
      },
      orderBy: [{ orderDate: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      totalCount,
      data: orders,
      pageSize
    };
  } catch (error) {
    logger.error("Failed to fetch filtered orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}
