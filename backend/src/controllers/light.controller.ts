import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";
import { addToHistory } from "./history.controller";

// Light sensor state - always false until MQTT updates it
let currentLightSensorState = false;

// REST: GET /light/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentLightSensorState ? 1 : 0,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for light:current
export function updateCurrent(newValue: boolean) {
  currentLightSensorState = newValue;

  const payload: ValuePayload = {
    value: currentLightSensorState ? 1 : 0,
    timestamp: new Date(),
  };
  
  addToHistory("light", payload);

  io.emit("light:current", payload);
}
