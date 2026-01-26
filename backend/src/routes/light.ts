import { Router } from "express";
import { getCurrent, toggleLight } from "../controllers/light.controller";
const lightRouter = Router();

lightRouter.get("/current", getCurrent);
lightRouter.post("/toggle", toggleLight);

export default lightRouter;
