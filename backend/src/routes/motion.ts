import { Router } from "express";
import { getCurrent } from "../controllers/motion.controller";
const motionRouter = Router();

motionRouter.get("/current", getCurrent);

export default motionRouter;
