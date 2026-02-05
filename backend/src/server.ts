import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectToMQTT } from "./services/mqtt.service";
import { setupAlarmSocket } from "./controllers/alarm.controller";
import { setupHiddenSensorsSocket } from "./controllers/hidden-sensors.controller";
import { setupWasteAlertSocket } from "./controllers/waste-alert.controller";
import { setupThermalComfortSocket } from "./controllers/thermal-comfort.controller";

const PORT = 3000;

const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8100",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// Setup socket communication for all controllers
setupAlarmSocket();
setupHiddenSensorsSocket();
setupWasteAlertSocket();
setupThermalComfortSocket();

// Connect to MQTT broker and receive real sensor data
connectToMQTT();

httpServer.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`),
);
