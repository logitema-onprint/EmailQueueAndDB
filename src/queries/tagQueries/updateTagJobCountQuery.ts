import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";

type Operation = 'increment' | 'decrement';

export async function updateTagJobCountQuery(tagId: string, operation: Operation) {
    try {
        const command = new UpdateCommand({
            TableName: config.aws.queueTagTableName,
            Key: { tagId },
            UpdateExpression: "SET #jobCount = if_not_exists(#jobCount, :zero) + :change, #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#jobCount": "jobCount",
                "#updatedAt": "updatedAt"
            },
            ExpressionAttributeValues: {
                ":change": operation === 'increment' ? 1 : -1,
                ":zero": 0,
                ":updatedAt": new Date().toISOString()
            },
            ReturnValues: "ALL_NEW"
        });

        const result = await dynamoDb.send(command);
        return { success: true, data: result.Attributes };
        
    } catch (error) {
        console.error("Error updating tag job count:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
