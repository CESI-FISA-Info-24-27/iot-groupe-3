import { Router } from "express";
import { getCurrent, setCurrent } from "../controllers/alarm.controller";

const alarmRouter = Router();

alarmRouter.get("/current", getCurrent);
alarmRouter.put("/current", setCurrent);

export default alarmRouter;
