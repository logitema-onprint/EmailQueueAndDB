import { tagQueries } from "../queries/tagQueries";
import logger from "../utils/logger";
import { serializeBigInt } from "./serializeBigInt";

export async function validateAndGetTags(tagIds: number[]) {
  const tagPromises = tagIds.map((tagId) => tagQueries.getTag(tagId));
  const tagResults = await Promise.all(tagPromises);

  const tags = tagResults
    .filter((result) => result !== undefined && result.data !== undefined)
    .map((result) => result.data);

  const serializedTags = serializeBigInt(tags);

  return serializedTags;
}
