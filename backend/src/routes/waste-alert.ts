import { Router } from "express";
import { getCurrent } from "../controllers/waste-alert.controller";

const wasteAlertRouter = Router();

wasteAlertRouter.get("/current", getCurrent);

export default wasteAlertRouter;
