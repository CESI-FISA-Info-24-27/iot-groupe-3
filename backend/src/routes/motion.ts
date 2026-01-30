import { Router } from "express";
import { getCurrent, toggleMotion } from "../controllers/motion.controller";
const motionRouter = Router();

/**
 * @swagger
 * /motion/current:
 *   get:
 *     summary: Get current motion detection
 *     description: Returns the current motion sensor status (value is boolean - true for motion detected, false for no motion)
 *     tags:
 *       - Motion
 *     responses:
 *       200:
 *         description: Current motion detection status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 */
motionRouter.get("/current", getCurrent);

/**
 * @swagger
 * /motion/toggle:
 *   post:
 *     summary: Toggle motion detection state
 *     description: Switches the motion detection state (toggles between true and false)
 *     tags:
 *       - Motion
 *     responses:
 *       200:
 *         description: Motion detection state toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 */
motionRouter.post("/toggle", toggleMotion);

export default motionRouter;
