import { Router } from "express";
import { getAverage, getCurrent } from "../controllers/temperature.controller";
const temperatureRouter = Router();

temperatureRouter.get("/current", getCurrent);
temperatureRouter.get("/average", getAverage);

export default temperatureRouter;
