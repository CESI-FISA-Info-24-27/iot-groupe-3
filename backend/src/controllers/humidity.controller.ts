import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let averageHumidity = NaN;
let currentHumidity = NaN;

// REST: GET /humidity/average
export function getAverage(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: averageHumidity,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: GET /humidity/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentHumidity,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /humidity/current
export function setCurrent(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateCurrent(value);

  const payload: ValuePayload = {
    value: currentHumidity,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /humidity/average
export function setAverage(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateAverage(value);

  const payload: ValuePayload = {
    value: averageHumidity,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for humidity:average
export function updateAverage(newValue: number) {
  averageHumidity = newValue;

  const payload: ValuePayload = {
    value: averageHumidity,
    timestamp: new Date(),
  };

  io.emit("humidity:average", payload);
}

// StreamIO updates for humidity:current
export function updateCurrent(newValue: number) {
  currentHumidity = newValue;

  const payload: ValuePayload = {
    value: currentHumidity,
    timestamp: new Date(),
  };
  io.emit("humidity:current", payload);
}

export function startHumidityDemo() {
  setInterval(() => {
    const next = Math.round((40 + Math.random() * 20) * 10) / 10;
    updateAverage(next);
    updateCurrent(next);
  }, 500);
}
