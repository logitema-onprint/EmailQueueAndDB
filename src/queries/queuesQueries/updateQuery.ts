import { dynamoDb } from "../../services/dynamoDb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import config from "../../config";
export async function updateSendTimeQuery(jobId: string, sendTime: number) {
  const command = new UpdateCommand({
    TableName: config.aws.queueTableName,
    Key: {
      jobId: jobId,
    },
    UpdateExpression: "SET scheduledFor = :scheduledFor",
    ExpressionAttributeValues: {
      ":scheduledFor": sendTime,
    },
    ConditionExpression: "attribute_exists(jobId)",
    ReturnValues: "ALL_NEW",
  });

  try {
    const response = await dynamoDb.send(command);
    return {
      success: true,
      message: "Send time updated successfully",
      data: response.Attributes,
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        success: false,
        error: "Job with this Id not found",
      };
    }
    return {
      success: false,
      error: `Failed to update send time: ${error}`,
    };
  }
}
