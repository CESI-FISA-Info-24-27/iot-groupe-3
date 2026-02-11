import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";
import { addToHistory } from "./history.controller";

let averageSound = NaN;
let currentSound = NaN;

// REST: GET /sound/average
export function getAverage(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: averageSound,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: GET /sound/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentSound,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /sound/current
export function setCurrent(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateCurrent(value);

  const payload: ValuePayload = {
    value: currentSound,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /sound/average
export function setAverage(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Value must be a number" });
  }

  updateAverage(value);

  const payload: ValuePayload = {
    value: averageSound,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for sound:average
export function updateAverage(newValue: number) {
  averageSound = newValue;

  const payload: ValuePayload = {
    value: averageSound,
    timestamp: new Date(),
  };

  io.emit("sound:average", payload);
}

// StreamIO updates for sound:current
export function updateCurrent(newValue: number) {
  currentSound = newValue;

  const payload: ValuePayload = {
    value: currentSound,
    timestamp: new Date(),
  };
  
  addToHistory("sound", payload);
  
  io.emit("sound:current", payload);
}
