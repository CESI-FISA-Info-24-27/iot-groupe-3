import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let currentLightState = false;

// REST: GET /light/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentLightState ? 1 : 0,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: POST /light/toggle
export function toggleLight(req: Request, res: Response) {
  currentLightState = !currentLightState;
  updateCurrent(currentLightState);

  const payload: ValuePayload = {
    value: currentLightState ? 1 : 0,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for light:current
export function updateCurrent(newValue: boolean) {
  currentLightState = newValue;

  const payload: ValuePayload = {
    value: currentLightState ? 1 : 0,
    timestamp: new Date(),
  };

  io.emit("light:current", payload);
}

export function startLightDemo() {
  setInterval(() => {
    // 30% chance to toggle the light state
    if (Math.random() > 0.7) {
      currentLightState = !currentLightState;
      updateCurrent(currentLightState);
    }
  }, 3000);
}
