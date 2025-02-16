import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { tagRoutes } from "./tagRoutes";
import { ruleRoutes } from "./ruleRoutes";
import { orderRoutes } from "./orderRoutes";

const routes = (server: Express) => {
  queueRoutes(server);
  tagRoutes(server);
  ruleRoutes(server);
  orderRoutes(server);
};

export default routes;
