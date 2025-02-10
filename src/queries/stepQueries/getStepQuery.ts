import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";
import logger from "../../utils/logger";

export async function getStepQuery(stepId: string) {
  const command = new GetCommand({
    TableName: config.aws.queueStepTableName,
    Key: {
      stepId: stepId,
    },
  });

  try {
    const response = await dynamoDb.send(command);
    logger.info("NewStep:", response.Item);
    return {
      success: true,
      item: response.Item,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get queue item: ${error}`,
    };
  }
}
