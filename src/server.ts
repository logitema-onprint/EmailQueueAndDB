import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import responseTime from "response-time";
import healthcheck from "express-healthcheck";
import "express-async-errors";

import log from "./utils/logger";
import config from "./config";
import routes from "./route";

const server = express();

server.use(helmet());
server.use(cors({ credentials: true }));
server.use(morgan("combined"));
server.use(responseTime());

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
server.use(limiter);

server.use(
  "/health",
  healthcheck({
    healthy: () => ({
      uptime: process.uptime(),
      message: "OK",
      timestamp: new Date().toISOString(),
    }),
  })
);


server.listen(config.server.port, () => {
  log.info(
    `🚀 Server running on: http://${config.server.domain}:${config.server.port}`
  );
  routes(server)
});
