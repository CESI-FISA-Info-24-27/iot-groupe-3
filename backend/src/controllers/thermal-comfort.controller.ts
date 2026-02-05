import { Request, Response } from "express";
import {
  ThermalComfort,
  ThermalComfortPayload,
} from "../models/thermal-comfort.model";
import { io } from "../server";

let currentComfort: ThermalComfortPayload | null = null;
let hasReceivedData = false;

// Calculate thermal comfort based on temperature and humidity
function calculateThermalComfort(
  temperature: number,
  humidity: number,
): ThermalComfort {
  // Temperature ranges (°C)
  const isTooHot = temperature >= 28;
  const isHot = temperature >= 24 && temperature < 28;
  const isComfortable = temperature >= 19 && temperature < 24;
  const isCold = temperature >= 16 && temperature < 19;
  const isTooCold = temperature < 16;

  // Humidity ranges (%)
  const isTooHumid = humidity >= 65;
  const isHumid = humidity >= 55 && humidity < 65;
  const isDry = humidity < 35;
  const isTooDry = humidity < 25;

  // Determine comfort level
  if (isTooCold) {
    if (isTooDry) return ThermalComfort.TOO_COLD_AND_DRY;
    if (isDry) return ThermalComfort.TOO_COLD_AND_DRY;
    if (isTooHumid || isHumid) return ThermalComfort.TOO_COLD_AND_HUMID;
    return ThermalComfort.TOO_COLD;
  }

  if (isCold) {
    if (isTooDry || isDry) return ThermalComfort.COLD_AND_DRY;
    if (isTooHumid || isHumid) return ThermalComfort.COLD_AND_HUMID;
    return ThermalComfort.COLD;
  }

  if (isComfortable) {
    if (isTooDry || isDry || isTooHumid || isHumid) {
      // Slightly uncomfortable due to humidity
      if (isTooDry || isDry) return ThermalComfort.COMFORTABLE;
      return ThermalComfort.COMFORTABLE;
    }
    return ThermalComfort.COMFORTABLE;
  }

  if (isHot) {
    if (isTooDry || isDry) return ThermalComfort.WARM_AND_DRY;
    if (isTooHumid || isHumid) return ThermalComfort.WARM_AND_HUMID;
    return ThermalComfort.WARM;
  }

  if (isTooHot) {
    if (isTooDry || isDry) return ThermalComfort.TOO_HOT_AND_DRY;
    if (isTooHumid || isHumid) return ThermalComfort.TOO_HOT_AND_HUMID;
    return ThermalComfort.TOO_HOT;
  }

  return ThermalComfort.COMFORTABLE;
}

// REST: GET /thermal-comfort
export function getCurrent(req: Request, res: Response) {
  res.json(currentComfort);
}

// Update thermal comfort based on temperature and humidity
export function updateComfort(temperature: number, humidity: number) {
  const comfort = calculateThermalComfort(temperature, humidity);

  currentComfort = {
    comfort,
    temperature,
    humidity,
    timestamp: new Date(),
  };

  hasReceivedData = true;
  io.emit("thermal-comfort:current", currentComfort);
}

// Setup Socket.IO to emit current state on connection
export function setupThermalComfortSocket() {
  io.on("connection", (socket) => {
    if (hasReceivedData && currentComfort) {
      socket.emit("thermal-comfort:current", currentComfort);
    }
  });
}
