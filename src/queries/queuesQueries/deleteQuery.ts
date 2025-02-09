import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import config from "../../config";
import { dynamoDb } from "../../services/dynamoDb";

export async function deleteQueue(jobId: string) {
  const command = new DeleteCommand({
    TableName: config.aws.queueTableName,
    Key: {
      jobId: jobId,
    },
    ConditionExpression: "attribute_exists(jobId)",
  });

  try {
    await dynamoDb.send(command);
    return {
      success: true,
      message: "Eilė buvo sekimingai ištrinta",
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        success: false,
        error: "Eilė su tokiu Id nerasta",
      };
    }
    return {
      success: false,
      error: `Nepavyko ištrinti eilės: ${error}`,
    };
  }
}
