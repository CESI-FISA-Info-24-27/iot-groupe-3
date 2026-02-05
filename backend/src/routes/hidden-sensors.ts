import { Router } from "express";
import { getCurrent } from "../controllers/hidden-sensors.controller";

const hiddenSensorsRouter = Router();

hiddenSensorsRouter.get("/current", getCurrent);

export default hiddenSensorsRouter;
