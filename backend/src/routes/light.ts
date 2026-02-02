import { Router } from "express";
import { getCurrent } from "../controllers/light.controller";
const lightRouter = Router();

/**
 * @swagger
 * /light/current:
 *   get:
 *     summary: Get current light sensor status
 *     description: Returns the current light sensor state (value is 1 for light detected, 0 for dark). This is a read-only value from the light sensor.
 *     tags:
 *       - Light
 *     responses:
 *       200:
 *         description: Current light sensor status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 */
lightRouter.get("/current", getCurrent);

export default lightRouter;
