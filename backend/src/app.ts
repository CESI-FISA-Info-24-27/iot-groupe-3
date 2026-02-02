import cors from "cors";
import express from "express";
import humidityRouter from "./routes/humidity";
import statusRouter from "./routes/status";
import temperatureRouter from "./routes/temperature";
import lightRouter from "./routes/light";
import motionRouter from "./routes/motion";
import { setupSwagger } from "./swagger";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8100",
    credentials: true,
  }),
);
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

app.use("/temperature", temperatureRouter);
app.use("/humidity", humidityRouter);
app.use("/light", lightRouter);
app.use("/motion", motionRouter);

app.use("/", statusRouter);

export default app;
