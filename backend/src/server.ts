import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { startHumidityDemo } from "./controllers/humidity.controller";
import { startTemperatureDemo } from "./controllers/temperature.controller";
import { startLightDemo } from "./controllers/light.controller";
import { startMotionDemo } from "./controllers/motion.controller";

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

startTemperatureDemo();
startHumidityDemo();
startLightDemo();
startMotionDemo();

httpServer.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`),
);
