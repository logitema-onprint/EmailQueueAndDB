import { QueryCommand } from "@aws-sdk/client-dynamodb";
import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";
import logger from "../../utils/logger";

export async function getQueuesByStatus(
  status: string,
  limit: number,
  lastEvaluatedKey?: any
) {
  const command = new QueryCommand({
    TableName: config.aws.queueTableName,
    IndexName: "status-index",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": { S: status },
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
