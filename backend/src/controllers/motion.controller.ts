import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";
import { addToHistory } from "./history.controller";

let currentMotionState = false;

// REST: GET /motion/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: currentMotionState,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: POST /motion/toggle
export function toggleMotion(req: Request, res: Response) {
  currentMotionState = !currentMotionState;
  updateCurrent(currentMotionState);

  const payload: ValuePayload = {
    value: currentMotionState,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for motion:current
export function updateCurrent(newValue: boolean) {
  currentMotionState = newValue;

  const payload: ValuePayload = {
    value: currentMotionState,
    timestamp: new Date(),
  };
  
  addToHistory("motion", payload);

  io.emit("motion:current", payload);
}

export function startMotionDemo() {
  setInterval(() => {
    // 30% chance of motion detection
    const newMotionState = Math.random() > 0.7;

    // Only emit if state changes
    if (newMotionState !== currentMotionState) {
      updateCurrent(newMotionState);
    }
  }, 3000);
}
