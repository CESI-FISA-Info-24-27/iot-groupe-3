import { Router } from "express";
import { exportCSV } from "../controllers/export.controller";

const exportRouter = Router();

/**
 * @swagger
 * /export/csv:
 *   get:
 *     summary: Export sensor data as CSV
 *     description: Exports historical sensor data as a CSV file for the last N hours (default 24h)
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Number of hours of history to export
 *     responses:
 *       200:
 *         description: CSV file with sensor data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
exportRouter.get("/csv", exportCSV);

export default exportRouter;
