import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";
import { addToHistory } from "./history.controller";

let averageTemperature = NaN;
let currentTemperature = NaN;
// REST: GET /temperature/average
export function getAverage(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: averageTemperature,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: GET /temperature/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentTemperature,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /temperature/current
export function setCurrent(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateCurrent(value);

  const payload: ValuePayload = {
    value: currentTemperature,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /temperature/average
export function setAverage(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateAverage(value);

  const payload: ValuePayload = {
    value: averageTemperature,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for temperature:average
export function updateAverage(newValue: number) {
  averageTemperature = newValue;

  const payload: ValuePayload = {
    value: averageTemperature,
    timestamp: new Date(),
  };

  io.emit("temperature:average", payload);
}

// StreamIO updates for temperature:current
export function updateCurrent(newValue: number) {
  currentTemperature = newValue;

  const payload: ValuePayload = {
    value: currentTemperature,
    timestamp: new Date(),
  };
  
  addToHistory("temperature", payload);
  
  io.emit("temperature:current", payload);
}

export function startTemperatureDemo() {
  setInterval(() => {
    const next = Math.round((20 + Math.random() * 5) * 10) / 10;
    updateAverage(next);
    updateCurrent(next);
  }, 500);
}
