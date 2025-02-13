import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";
import logger from "../../utils/logger";

export async function getQueuesByTag(
  tagId: string,
  limit: number,
  lastEvaluatedKey?: any
) {
  const command = new QueryCommand({
    TableName: config.aws.queueTableName,
    IndexName: "tagId-index",
    KeyConditionExpression: "#tagId = :tagId",
    ExpressionAttributeNames: {
      "#tagId": "tagId",
    },
    ExpressionAttributeValues: {
      ":tagId": tagId,
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  });

  try {
    const result = await dynamoDb.send(command);
    return {
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    logger.error("Failed to get queues", error);
    throw error;
  }
}
