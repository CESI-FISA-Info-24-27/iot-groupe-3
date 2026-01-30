import { Router } from "express";
import { getAverage, getCurrent, setAverage, setCurrent } from "../controllers/pressure.controller";
const pressureRouter = Router();

/**
 * @swagger
 * /pressure/current:
 *   get:
 *     summary: Get current pressure
 *     description: Returns the most recent pressure reading from the sensor (value in hPa)
 *     tags:
 *       - Pressure
 *     responses:
 *       200:
 *         description: Current pressure reading
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set current pressure
 *     description: Manually set the current pressure reading (value in hPa)
 *     tags:
 *       - Pressure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Pressure updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
pressureRouter.get("/current", getCurrent);
pressureRouter.put("/current", setCurrent);

/**
 * @swagger
 * /pressure/average:
 *   get:
 *     summary: Get average pressure
 *     description: Returns the average pressure over recent readings (value in hPa)
 *     tags:
 *       - Pressure
 *     responses:
 *       200:
 *         description: Average pressure value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *   put:
 *     summary: Set average pressure
 *     description: Manually set the average pressure value (value in hPa)
 *     tags:
 *       - Pressure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetValueRequest'
 *     responses:
 *       200:
 *         description: Average pressure updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValuePayload'
 *       400:
 *         description: Invalid value provided
 */
pressureRouter.get("/average", getAverage);
pressureRouter.put("/average", setAverage);

export default pressureRouter;
