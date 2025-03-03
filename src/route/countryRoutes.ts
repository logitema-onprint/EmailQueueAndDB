import { Router, Express } from "express";
import { countryController } from "../controllers/countryControllers";

const router = Router();

export const countryRoutes = async (server: Express) => {
  server.get("/api/countries", countryController.getAllCountries);
};

export default router;
