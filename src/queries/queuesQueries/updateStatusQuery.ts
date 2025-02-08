import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function updateStatusQuery(jobId: string, status: string) {
  const command = new UpdateCommand({
    TableName: config.aws.queueTableName,
    Key: {
      jobId: jobId,
    },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await dynamoDb.send(command);
    return {
      success: true,
      data: result.Attributes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}
