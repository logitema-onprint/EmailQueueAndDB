import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../../services/dynamoDb";
import config from "../../config";
import { Order } from "../../types/orderApi";
import logger from "../../utils/logger";

export async function create(orderData: Order) {
    logger.error("Data:", orderData)
    try {
        logger.info(orderData)
        const command = new PutCommand({
            TableName: config.aws.orderTableName,
            Item: orderData,
            ConditionExpression: "attribute_not_exists(orderId)",
        })
        console.log('Fires')
        const result = await dynamoDb.send(command)
        logger.info(result.ConsumedCapacity)
        logger.info(result.Attributes)
        return {
            success: true,
            data: orderData
        }
    } catch (error) {
        return {
            success: false,
            error: `Failed to create order: ${error}`,
        };
    }
}