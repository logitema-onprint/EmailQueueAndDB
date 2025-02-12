import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";
import logger from "../../utils/logger";

export async function getByStatusAndTag(
  tagId: string,
  status: string,
  limit: number,
  lastEvaluatedKey?: any
) {
  const command = new QueryCommand({
    TableName: config.aws.queueTableName,
    IndexName: "tagIdStatus-index",
    KeyConditionExpression: "#tagId = :tagId AND #status = :status",
    ExpressionAttributeNames: {
      "#tagId": "tagId",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":tagId": tagId,
      ":status": status,
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  });

  try {
    const result = await dynamoDb.send(command);
    logger.info(
      `Found ${
        result.Items?.length || 0
      } items for tagId ${tagId} with status ${status}`
    );

    return {
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    logger.error(
      `Failed to get queues for tagId ${tagId} and status ${status}`,
      error
    );
    throw error;
  }
}
