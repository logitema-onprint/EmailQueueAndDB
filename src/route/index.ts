import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { orderRoutes } from "./orderRoutes";

const routes = (server: Express) => {
  queueRoutes(server);
  orderRoutes(server)
};

export default routes;
