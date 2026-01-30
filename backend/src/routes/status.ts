import { Router } from "express";
import { getStatus } from "../controllers/status.controller";
const statusRouter = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check API status
 *     description: Returns the health status of the API
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "online"
 *                 message:
 *                   type: string
 *                   example: "API is running"
 */
statusRouter.get("/", getStatus);

export default statusRouter;
