import { GetObjectCommand } from "@aws-sdk/client-s3";
import config from "../../config";
import { s3client } from "../../services/s3bucket";
import logger from "../../utils/logger";
import { extractKeyFromUrl } from "../../helpers/extractKeyFromUrl";


export async function getHtmlContent(url: string) {
    logger.success(url)
    try {

        const key = extractKeyFromUrl(url);
        logger.info("Extracted key:", key);

        const getCommand = new GetObjectCommand({
            Bucket: config.aws.templateBucket,
            Key: key
        })

        const data = await s3client.send(getCommand)
        const bodyContents = await data.Body?.transformToString();

        const regex = /\{([a-zA-Z0-9]+)\}/g;
        const matches = bodyContents?.match(regex) || [];
        const variables = matches.map(match => match.replace(/{|}/g, ''));
        const uniqueVariables = [...new Set(variables)];
        logger.info("Template variables:", uniqueVariables);


        return {
            success: true,
            htmlContent: variables
        }
    } catch (error) {
        logger.error("Error fetching HTML content:", error);
        return {
            sucess: false,
            message: "Error fetching HTML content",
        }
    }
}