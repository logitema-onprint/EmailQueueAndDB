import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import config from "../config";

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: config.aws.access!,
    secretAccessKey: config.aws.secret!,
  },
  region: config.aws.region,
});

export const dynamoDb = DynamoDBDocumentClient.from(client);
