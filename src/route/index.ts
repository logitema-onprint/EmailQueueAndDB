import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { tagRoutes } from "./tagRoutes";
import { ruleRoutes } from "./ruleRoutes";

const routes = (server: Express) => {
  queueRoutes(server);
  tagRoutes(server);
  ruleRoutes(server);
};

export default routes;
