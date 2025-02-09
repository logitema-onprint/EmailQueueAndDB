import { QueryCommand } from "@aws-sdk/client-dynamodb";
import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";
import logger from "../../utils/logger";


export async function getQueueCount(status: string) {
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
    Select: "COUNT",
  });

  try {
    const result = await dynamoDb.send(command);
    logger.info(
      `Successfully got queue count for status: ${status} count: ${result.Count}`
    );
    return result.Count || 0;
  } catch (error) {
    logger.error("Failed to get queue count", error);
    throw error;
  }
}
