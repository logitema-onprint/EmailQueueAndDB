import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import logger from "../../utils/logger";

export async function getByAgentAndTagId(
    salesAgentId: string, 
    tagId: string
  ) {
    try {
      const command = new QueryCommand({
        TableName: config.aws.orderTableName,
        IndexName: "agentTagStatusKeys-index",
        KeyConditionExpression: "begins_with(agentTagStatusKeys, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": `${salesAgentId}#${tagId}#`
        }
      });
  
      const res = await dynamoDb.send(command);
      return {
        success: true,
        data: res.Items,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed have fun ${error}`,
      };
    }
  }
