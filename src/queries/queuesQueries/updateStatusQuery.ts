import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function updateStatusQuery(jobId: string, status: string) {
  const timestamp = new Date().toISOString();
  const command = new UpdateCommand({
    TableName: config.aws.queueTableName,
    Key: {
      jobId: jobId,
    },
    UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updatedAt": timestamp,
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
