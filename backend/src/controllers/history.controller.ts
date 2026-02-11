import { ValuePayload } from "../models/value-payload";

interface HistoryEntry {
  timestamp: Date;
  value: number | boolean;
}

interface SensorHistory {
  temperature: HistoryEntry[];
  humidity: HistoryEntry[];
  pressure: HistoryEntry[];
  sound: HistoryEntry[];
  motion: HistoryEntry[];
  light: HistoryEntry[];
}

export const sensorHistory: SensorHistory = {
  temperature: [],
  humidity: [],
  pressure: [],
  sound: [],
  motion: [],
  light: [],
};

const MAX_HISTORY_SIZE = 10000;

export function addToHistory(
  sensor: keyof SensorHistory,
  payload: ValuePayload
) {
  const entry: HistoryEntry = {
    timestamp: new Date(),
    value: payload.value,
  };

  sensorHistory[sensor].push(entry);

  if (sensorHistory[sensor].length > MAX_HISTORY_SIZE) {
    sensorHistory[sensor].shift();
  }
}
