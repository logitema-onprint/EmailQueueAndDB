import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../../../services/dynamoDb";
import config from "../../../config";
import { RevalidateService } from "../../../services/revalidateNext";

export async function deleteManyQuery(jobIds: string[]) {
  const chunks = [];
  const BATCH_SIZE = 25;

  for (let i = 0; i < jobIds.length; i += BATCH_SIZE) {
    chunks.push(jobIds.slice(i, i + BATCH_SIZE));
  }

  try {
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const deleteRequest = chunk.map((jobId) => ({
          DeleteRequest: {
            Key: { jobId },
          },
        }));
        const command = new BatchWriteCommand({
          RequestItems: {
            [config.aws.queueTableName]: deleteRequest,
          },
        });
        return dynamoDb.send(command);
      })
    );

    const hasUnprocessedItems = results.some(
      (result) =>
        result.UnprocessedItems &&
        Object.keys(result.UnprocessedItems).length > 0
    );
    if (hasUnprocessedItems) {
      await RevalidateService.revalidateAll();
      return {
        success: false,
        error: "Kai kurių eilių nepavyko ištrinti. Perkraukite puslapįs",
        partialSuccess: true,
      };
    }
    return {
      success: true,
      message: "Eilės buvo sėkmingai ištrintos",
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Nepavyko ištrinti eilių: ${error}`,
    };
  }
}
