import { Router } from "express";
import { getAverage, getCurrent, setAverage, setCurrent } from "../controllers/sound.controller";
const soundRouter = Router();

/**
 * @swagger
 * /sound/current:
 *   get:
 *     summary: Get current sound level
 *     description: Returns the most recent sound level reading from the sensor (value in dB)
 *     tags:
 *       - Sound
 *     responses:
 *       200:
 *         description: Current sound level reading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set current sound level
 *     description: Manually set the current sound level reading (value in dB)
 *     tags:
 *       - Sound
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Sound level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
soundRouter.get("/current", getCurrent);
soundRouter.put("/current", setCurrent);

/**
 * @swagger
 * /sound/average:
 *   get:
 *     summary: Get average sound level
 *     description: Returns the average sound level over recent readings (value in dB)
 *     tags:
 *       - Sound
 *     responses:
 *       200:
 *         description: Average sound level value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set average sound level
 *     description: Manually set the average sound level value (value in dB)
 *     tags:
 *       - Sound
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Average sound level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
soundRouter.get("/average", getAverage);
soundRouter.put("/average", setAverage);

export default soundRouter;
