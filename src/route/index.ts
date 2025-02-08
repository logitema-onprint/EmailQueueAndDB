import { Express } from "express";
import { queueRoutes } from "./queueRoutes";

const routes = (server: Express) => {
  queueRoutes(server);
};

export default routes;
