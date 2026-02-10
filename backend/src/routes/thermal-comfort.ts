import { Router } from "express";
import { getCurrent } from "../controllers/thermal-comfort.controller";

const thermalComfortRouter = Router();

thermalComfortRouter.get("/current", getCurrent);

export default thermalComfortRouter;
