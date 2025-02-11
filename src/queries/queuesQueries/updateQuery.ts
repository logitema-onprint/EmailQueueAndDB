import { dynamoDb } from "../../services/dynamoDb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Step } from "../../types/queueApi";
import config from "../../config";

interface UpdateQueueParams {
  steps?: Record<string, Step>;
  currentStepId?: string;
  status?: string;
  currentStep?: number;
}

export const updateQueue = async (
  jobId: string,
  updates: UpdateQueueParams
) => {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (updates.steps) {
      updateExpressions.push("#steps = :steps");
      expressionAttributeNames["#steps"] = "steps";
      expressionAttributeValues[":steps"] = updates.steps;
    }

    if (updates.currentStepId) {
      updateExpressions.push("#currentStepId = :currentStepId");
      expressionAttributeNames["#currentStepId"] = "currentStepId";
      expressionAttributeValues[":currentStepId"] = updates.currentStepId;
    }

    if (updates.status) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = updates.status;
    }

    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: config.aws.queueTableName,
      Key: {
        jobId: jobId,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dynamoDb.send(command);
    return response.Attributes;
  } catch (error) {
    console.error("Error updating queue:", error);
    throw error;
  }
};
