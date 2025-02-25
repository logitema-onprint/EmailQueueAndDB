import { RequestHandler, Request, Response } from "express";
import { orderQueries } from "../../../queries/orderQueries";
import { rulesQueries } from "../../../queries/rulesQueries";
import { QueueService } from "../../../services/queueService";
import logger from "../../../utils/logger";
import { OrderData } from "../createOrder";

// Typed helper functions
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomPhone = (): string => {
  return `+${getRandomNumber(1, 99)}${Array(9).fill(0).map(() => getRandomNumber(0, 9)).join('')}`;
};

// Type definitions for data structures
type ProductMap = {
  [key: number]: string;
};

type CityMap = {
  [country: string]: string[];
};

export const createMassOrder: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    // Configuration with defaults
    const count: number = req.body.count || 5000;
    const batchSize: number = req.body.batchSize || 100;
    const concurrency: number = req.body.concurrency || 10;

    // Focused on Baltic countries only
    const productIds: number[] = [10, 30, 100];
    const countries: string[] = ["Lietuva", "Latvija", "Estija"];
    
    // Typed city map
    const cities: CityMap = {
      "Lietuva": ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"],
      "Latvija": ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala"],
      "Estija": ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve"],
    };
    
    const companyNames: string[] = [
      "TechCorp", "GlobalSolutions", "InnovateNow", "NextGen Systems",
      "EcoFriendly", "SmartTech", "FutureBiz", "MegaCorp",
      "SkyHigh Enterprises", "OceanBlue Solutions"
    ];
    
    // Typed product map
    const products: ProductMap = {
      10: "Business Cards",
      30: "Brochures",
      100: "Posters"
    };
    
    const firstNames: string[] = [
      "Jonas", "Milda", "Vytautas", "Gabija", "Lukas", 
      "Ainis", "Lina", "Martynas", "Rūta", "Domas",
      "Andris", "Līga", "Jānis", "Kristīne", "Pēteris",
      "Märt", "Kati", "Jaan", "Tiiu", "Hendrik"
    ];
    
    const lastNames: string[] = [
      "Kazlauskas", "Petrauskas", "Jankauskas", "Žukauskas", "Butkus",
      "Bērziņš", "Kalniņš", "Ozoliņš", "Jansons", "Krūmiņš",
      "Tamm", "Saar", "Sepp", "Kask", "Kukk"
    ];
    
    const paymentMethods: string[] = [
      "Credit Card", "PayPal", "Bank Transfer", "Google Pay", "Swedbank",
      "SEB Bank", "Revolut", "Cash on Delivery", "Paysera", "Invoice"
    ];

    const startTime: number = Date.now();
    const results: any[] = [];
    let totalCreated: number = 0;

    for (let i = 0; i < count; i += batchSize * concurrency) {
      // Break condition
      if (totalCreated >= count) break;

      const batches = Array(
        Math.min(concurrency, Math.ceil((count - totalCreated) / batchSize))
      )
        .fill(null)
        .map((_, batchIndex) => {
          return Array(batchSize)
            .fill(null)
            .map((_, index) => {
              const orderIndex = totalCreated + index;
              if (orderIndex >= count) return undefined;

              // Generate random data for each order
              const productId: number = getRandomElement(productIds);
              const country: string = getRandomElement(countries);
              const city: string = getRandomElement(cities[country]);
              const companyName: string = getRandomElement(companyNames);
              const firstName: string = getRandomElement(firstNames);
              const lastName: string = getRandomElement(lastNames);
              const subTotal: number = parseFloat((getRandomNumber(1000, 100000) / 100).toFixed(2));
              const salesAgentId: string = `agent${getRandomNumber(100, 999)}`;

              // Create typed order object
              const order: OrderData = {
                phoneNumber: generateRandomPhone(),
                userName: firstName,
                userSurname: lastName,
                paymentDetails: getRandomElement(paymentMethods),
                subTotal: subTotal,
                salesAgentId: salesAgentId,
                country: country,
                city: city,
                customerId: `cust${getRandomNumber(1000, 9999)}`,
                productName: products[productId],
                productId: productId,
                companyName: companyName,
              };

              return order;
            })
            .filter((order): order is OrderData => order !== undefined);
        });

      // Process batches in parallel
      const batchResults = await Promise.all(
        batches.map(async (batch) => {
          return Promise.all(
            batch.map(async (order) => {
              try {
                const orderResult = await orderQueries.createOrder(order);

                if (!orderResult.success) {
                  return {
                    success: false,
                    error: orderResult.error,
                    order: order, // Store original order for statistics
                  };
                }

                const tags = await rulesQueries.findRuleTagsByProductId(
                  order.productId
                );

                if (!tags.success || !tags.data?.tags) {
                  return {
                    success: false,
                    error: tags.error || "No tags found",
                    order: order,
                  };
                }

                const jobs = await QueueService.createQueues(
                  orderResult.data?.id as number,
                  tags.data.tags
                );

                return {
                  success: jobs.success,
                  orderId: orderResult.data?.id,
                  error: jobs.error,
                  order: order, // Store original order for statistics
                };
              } catch (error) {
                return {
                  success: false,
                  error: error instanceof Error ? error.message : "Unknown error",
                  order: order,
                };
              }
            })
          );
        })
      );

      const flatResults = batchResults.flat();
      results.push(...flatResults);

      totalCreated += flatResults.filter((r) => r.success).length;
      
      // Break if target reached
      if (totalCreated >= count) break;
    }

    const endTime: number = Date.now();
    const duration: number = endTime - startTime;

    // Generate statistics using TypeScript for better type safety
    type ProductStats = {
      [key: string]: number;
    };
    
    type CountryStats = {
      [key: string]: number;
    };

    const ordersByProduct: ProductStats = {};
    for (const id of productIds) {
      ordersByProduct[products[id]] = results.filter(r => 
        r.success && r.order && r.order.productId === id
      ).length;
    }

    const ordersByCountry: CountryStats = {};
    for (const country of countries) {
      ordersByCountry[country] = results.filter(r => 
        r.success && r.order && r.order.country === country
      ).length;
    }

    res.status(200).json({
      success: true,
      message: `Created ${totalCreated} orders`,
      totalTime: `${duration}ms`,
      averageTimePerOrder: `${duration / totalCreated}ms`,
      failedOrders: results.filter((r) => !r.success).length,
      successfulOrders: totalCreated,
      ordersByProduct,
      ordersByCountry
    });
  } catch (error) {
    logger.error("Failed to create Baltic mass orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Baltic mass orders",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};