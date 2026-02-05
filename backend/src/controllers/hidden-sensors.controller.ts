import { Request, Response } from "express";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let sensorsHidden = false;
let hasReceivedData = false;

// REST: GET /hidden-sensors/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: sensorsHidden,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for hidden-sensors:current
export function updateCurrent(newValue: boolean) {
  sensorsHidden = newValue;
  hasReceivedData = true;

  const payload: ValuePayload = {
    value: sensorsHidden,
    timestamp: new Date(),
  };

  io.emit("hidden-sensors:current", payload);
}

// Setup Socket.IO to emit current state on connection
export function setupHiddenSensorsSocket() {
  io.on("connection", (socket) => {
    if (hasReceivedData) {
      const payload: ValuePayload = {
        value: sensorsHidden,
        timestamp: new Date(),
      };
      socket.emit("hidden-sensors:current", payload);
    }
  });
}
