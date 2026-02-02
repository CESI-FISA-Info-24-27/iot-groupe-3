import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let averagePressure = NaN;
let currentPressure = NaN;

// REST: GET /pressure/average
export function getAverage(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: averagePressure,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: GET /pressure/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentPressure,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /pressure/current
export function setCurrent(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateCurrent(value);

  const payload: ValuePayload = {
    value: currentPressure,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /pressure/average
export function setAverage(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateAverage(value);

  const payload: ValuePayload = {
    value: averagePressure,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for pressure:average
export function updateAverage(newValue: number) {
  averagePressure = newValue;

  const payload: ValuePayload = {
    value: averagePressure,
    timestamp: new Date(),
  };

  io.emit("pressure:average", payload);
}

// StreamIO updates for pressure:current
export function updateCurrent(newValue: number) {
  currentPressure = newValue;

  const payload: ValuePayload = {
    value: currentPressure,
    timestamp: new Date(),
  };
  io.emit("pressure:current", payload);
}
