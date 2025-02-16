export function serializeBigInt(data: any): any {
  // If null or undefined, return as is
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeBigInt(item));
  }

  // Handle objects
  if (typeof data === "object") {
    const transformed = { ...data };

    for (const [key, value] of Object.entries(data)) {
      // Convert BigInt to number
      if (typeof value === "bigint") {
        transformed[key] = Number(value);
      }
      // Keep Date objects as is
      else if (value instanceof Date) {
        transformed[key] = value;
      }
      // Recursively transform nested objects
      else if (typeof value === "object" && value !== null) {
        transformed[key] = serializeBigInt(value);
      }
    }

    return transformed;
  }

  return data;
}
