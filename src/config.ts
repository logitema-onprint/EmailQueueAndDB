import * as dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = {
  SERVER_PORT: process.env.SERVER_PORT,
  SERVER_DOMAIN: process.env.SERVER_DOMAIN,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  REGION: process.env.REGION,
  QUEUE_TABLE_NAME: process.env.QUEUE_TABLE_NAME,
  QUEUE_STEP_TABLE: process.env.QUEUE_STEP_TABLE
} as const;

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missingVars
      .map((variable) => `  - ${variable}`)
      .join(
        "\n"
      )}\n\nPlease check your .env file and ensure all required variables are defined.`
  );
}

const config = {
  server: {
    domain: process.env.SERVER_DOMAIN!,
    port: process.env.SERVER_PORT!,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  aws: {
    queueTableName: process.env.QUEUE_TABLE_NAME!,
    queueStepTableName: process.env.QUEUE_STEP_TABLE!,
    access: process.env.ACCESS_KEY!,
    secret: process.env.SECRET_ACCESS_KEY!,
    region: process.env.REGION!,
  },
} as const;

export default config;
