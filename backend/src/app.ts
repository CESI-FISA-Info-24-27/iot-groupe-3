import cors from "cors";
import express from "express";
import humidityRouter from "./routes/humidity";
import statusRouter from "./routes/status";
import temperatureRouter from "./routes/temperature";
import lightRouter from "./routes/light";
import motionRouter from "./routes/motion";
import pressureRouter from "./routes/pressure";
import soundRouter from "./routes/sound";
import thermalComfortRouter from "./routes/thermal-comfort";
import hiddenSensorsRouter from "./routes/hidden-sensors";
import alarmRouter from "./routes/alarm";
import wasteAlertRouter from "./routes/waste-alert";
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
app.use("/pressure", pressureRouter);
app.use("/sound", soundRouter);
app.use("/thermal-comfort", thermalComfortRouter);
app.use("/hidden-sensors", hiddenSensorsRouter);
app.use("/alarm", alarmRouter);
app.use("/waste-alert", wasteAlertRouter);

app.use("/", statusRouter);

export default app;
