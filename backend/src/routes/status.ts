import { Router } from "express";
import { getStatus } from "../controllers/status.controller";
const statusRouter = Router();

statusRouter.get("/", getStatus);

export default statusRouter;
