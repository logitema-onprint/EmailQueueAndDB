import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { QueueItem } from "../../types/queueApi";

export async function createQueue(queueItem: QueueItem) {
  const command = new PutCommand({
    TableName: config.aws.queueTableName,
    Item: queueItem,
    ConditionExpression: "attribute_not_exists(id)",
  });

  try {
    await dynamoDb.send(command);
    return {
      success: true,
      data: queueItem,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create queue item: ${error}`,
    };
  }
}
