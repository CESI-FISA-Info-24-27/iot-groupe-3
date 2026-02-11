import { Request, Response } from "express";
import mqtt from "mqtt/*";
import { ValuePayload } from "../models/value-payload";
import { io } from "../server";

let alarmActive = false;
let mqttClient: mqtt.MqttClient | null = null;

export function setMQTTClient(client: mqtt.MqttClient) {
  mqttClient = client;
}

// REST: GET /alarm/current
export function getCurrent(req: Request, res: Response) {
  const payload: ValuePayload = {
    value: alarmActive,
    timestamp: new Date(),
  };
  res.json(payload);
}

// REST: PUT /alarm/current
export function setCurrent(req: Request, res: Response) {
  const { value } = req.body;

  if (typeof value !== "boolean") {
    return res.status(400).json({ error: "Value must be a boolean" });
  }

  updateCurrent(value, true);

  const payload: ValuePayload = {
    value: alarmActive,
    timestamp: new Date(),
  };
  res.json(payload);
}

// StreamIO updates for alarm:current
export function updateCurrent(newValue: boolean, fromFrontend = false) {
  alarmActive = newValue;

  const payload: ValuePayload = {
    value: alarmActive,
    timestamp: new Date(),
  };

  io.emit("alarm:current", payload);

  // If update came from frontend, publish to MQTT
  if (fromFrontend && mqttClient) {
    const mqttPayload = JSON.stringify({ value: alarmActive });
    mqttClient.publish("alarme/mode", mqttPayload, { retain: true });
  }
}

// Setup Socket.IO listeners for bidirectional communication
export function setupAlarmSocket() {
  io.on("connection", (socket) => {
    // Emit current state to newly connected client
    const payload: ValuePayload = {
      value: alarmActive,
      timestamp: new Date(),
    };
    socket.emit("alarm:current", payload);

    socket.on("alarm:toggle", (data: { value: boolean }) => {
      updateCurrent(data.value, true);
    });
  });
}
