import { Router } from "express";
import { getAverage, getCurrent, setAverage, setCurrent } from "../controllers/temperature.controller";
const temperatureRouter = Router();

/**
 * @swagger
 * /temperature/current:
 *   get:
 *     summary: Get current temperature
 *     description: Returns the most recent temperature reading from the sensor (value in Celsius)
 *     tags:
 *       - Temperature
 *     responses:
 *       200:
 *         description: Current temperature reading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set current temperature
 *     description: Manually set the current temperature reading (value in Celsius)
 *     tags:
 *       - Temperature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Temperature updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
temperatureRouter.get("/current", getCurrent);
temperatureRouter.put("/current", setCurrent);

/**
 * @swagger
 * /temperature/average:
 *   get:
 *     summary: Get average temperature
 *     description: Returns the average temperature over recent readings (value in Celsius)
 *     tags:
 *       - Temperature
 *     responses:
 *       200:
 *         description: Average temperature value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set average temperature
 *     description: Manually set the average temperature value (value in Celsius)
 *     tags:
 *       - Temperature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Average temperature updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
temperatureRouter.get("/average", getAverage);
temperatureRouter.put("/average", setAverage);

export default temperatureRouter;
