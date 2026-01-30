import { Router } from "express";
import { getAverage, getCurrent, setAverage, setCurrent } from "../controllers/humidity.controller";
const humidityRouter = Router();

/**
 * @swagger
 * /humidity/current:
 *   get:
 *     summary: Get current humidity
 *     description: Returns the most recent humidity reading from the sensor (value as percentage)
 *     tags:
 *       - Humidity
 *     responses:
 *       200:
 *         description: Current humidity reading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set current humidity
 *     description: Manually set the current humidity reading (value as percentage)
 *     tags:
 *       - Humidity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Humidity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
humidityRouter.get("/current", getCurrent);
humidityRouter.put("/current", setCurrent);

/**
 * @swagger
 * /humidity/average:
 *   get:
 *     summary: Get average humidity
 *     description: Returns the average humidity over recent readings (value as percentage)
 *     tags:
 *       - Humidity
 *     responses:
 *       200:
 *         description: Average humidity value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set average humidity
 *     description: Manually set the average humidity value (value as percentage)
 *     tags:
 *       - Humidity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Average humidity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
humidityRouter.get("/average", getAverage);
humidityRouter.put("/average", setAverage);

export default humidityRouter;
