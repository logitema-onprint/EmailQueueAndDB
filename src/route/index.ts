import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { tagRoutes } from "./tagRoutes";
import { ruleRoutes } from "./ruleRoutes";
import { orderRoutes } from "./orderRoutes";
import { salesAgentRoutes } from "./salesAgentRoutes";
import { productRoutes } from "./productRoutes";
import { countryRoutes } from "./countryRoutes";
import { customerRoutes } from "./customerRoutes";
import { graphRoutes } from "./graphApi";

const routes = (server: Express) => {
  countryRoutes(server);
  queueRoutes(server);
  productRoutes(server);
  tagRoutes(server);
  ruleRoutes(server);
  orderRoutes(server);
  salesAgentRoutes(server);
  customerRoutes(server);
  graphRoutes(server);
};

export default routes;
