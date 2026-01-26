import { Router } from "express";
import { getAverage, getCurrent } from "../controllers/humidity.controller";
const humidityRouter = Router();

humidityRouter.get("/current", getCurrent);
humidityRouter.get("/average", getAverage);

export default humidityRouter;
