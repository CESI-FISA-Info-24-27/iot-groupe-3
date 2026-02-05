import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let wasteDetected = false;
let lastLightState = false;
let lastMotionState = false;
let hasReceivedData = false;

// REST: GET /waste-alert/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: wasteDetected,
    timestamp: new Date(),
  };
  res.json(payload);
}

// Calculate and update waste alert
function calculateWasteAlert() {
  // Waste detected when: light is OFF but motion is DETECTED
  const newWasteDetected = !lastLightState && lastMotionState;

  if (newWasteDetected !== wasteDetected) {
    wasteDetected = newWasteDetected;

    const payload: ValuePayload = {
      value: wasteDetected,
      timestamp: new Date(),
    };

    io.emit("waste-alert:current", payload);

    if (wasteDetected) {
      console.log(
        "Waste alert: Light is OFF but motion detected - consider turning on the light",
      );
    }
  }
}

// Update light state and recalculate waste
export function updateLightState(lightOn: boolean) {
  lastLightState = lightOn;
  hasReceivedData = true;
  calculateWasteAlert();
}

// Update motion state and recalculate waste
export function updateMotionState(motionDetected: boolean) {
  lastMotionState = motionDetected;
  hasReceivedData = true;
  calculateWasteAlert();
}

// Setup Socket.IO to emit current state on connection
export function setupWasteAlertSocket() {
  io.on("connection", (socket) => {
    if (hasReceivedData) {
      const payload: ValuePayload = {
        value: wasteDetected,
        timestamp: new Date(),
      };
      socket.emit("waste-alert:current", payload);
    }
  });
}
