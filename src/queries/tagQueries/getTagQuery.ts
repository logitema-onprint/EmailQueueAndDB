import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";

export async function getTagQuery(tagId: string) {
  const command = new GetCommand({
    TableName: config.aws.queueTagTableName,
    Key: {
      tagId: tagId,
    },
  });

  try {
    const response = await dynamoDb.send(command);

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
