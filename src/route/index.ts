import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { tagRoutes } from "./tagRoutes";

const routes = (server: Express) => {
  queueRoutes(server);
  tagRoutes(server);
};

export default routes;
