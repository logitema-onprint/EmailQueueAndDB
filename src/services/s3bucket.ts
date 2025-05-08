import { S3Client } from "@aws-sdk/client-s3"
import config from "../config";



const client = new S3Client({
    credentials: {
        accessKeyId: config.aws.templateBucketKey!,
        secretAccessKey: config.aws.templateBucketAccess!
    },
    region: config.aws.region,
});

export const s3client = client;
export const bucketName = process.env.S3_BUCKET_NAME;