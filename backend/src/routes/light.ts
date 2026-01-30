import { Router } from "express";
import { getCurrent, toggleLight } from "../controllers/light.controller";
const lightRouter = Router();

/**
 * @swagger
 * /light/current:
 *   get:
 *     summary: Get current light status
 *     description: Returns the current light state (value is 1 for ON, 0 for OFF)
 *     tags:
 *       - Light
 *     responses:
 *       200:
 *         description: Current light status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 */
lightRouter.get("/current", getCurrent);

/**
 * @swagger
 * /light/toggle:
 *   post:
 *     summary: Toggle light state
 *     description: Switches the light on or off (returns value 1 for ON, 0 for OFF)
 *     tags:
 *       - Light
 *     responses:
 *       200:
 *         description: Light toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 */
lightRouter.post("/toggle", toggleLight);

export default lightRouter;
