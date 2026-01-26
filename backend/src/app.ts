import cors from "cors";
import express from "express";
import humidityRouter from "./routes/humidity";
import statusRouter from "./routes/status";
import temperatureRouter from "./routes/temperature";
import lightRouter from "./routes/light";
import motionRouter from "./routes/motion";
const app = express();

app.use(cors({ origin: "http://localhost:8100" }));
app.use(express.json());

app.use("/temperature", temperatureRouter);
app.use("/humidity", humidityRouter);
app.use("/light", lightRouter);
app.use("/motion", motionRouter);

app.use("/", statusRouter);

export default app;
