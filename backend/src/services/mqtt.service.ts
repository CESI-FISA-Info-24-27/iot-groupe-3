import mqtt from "mqtt";
import * as alarmController from "../controllers/alarm.controller";
import * as humidityController from "../controllers/humidity.controller";
import * as lightController from "../controllers/light.controller";
import * as motionController from "../controllers/motion.controller";
import * as pressureController from "../controllers/pressure.controller";
import * as soundController from "../controllers/sound.controller";
import * as temperatureController from "../controllers/temperature.controller";
import * as thermalComfortController from "../controllers/thermal-comfort.controller";
import * as wasteAlertController from "../controllers/waste-alert.controller";

const MQTT_BROKER_URL =
  process.env.NODE_ENV === "production"
    ? "ws://localhost:9001"
    : "ws://loicserre.freeboxos.fr:9001";

export function connectToMQTT() {
  console.log(`Connecting to MQTT broker at ${MQTT_BROKER_URL}...`);

  const client = mqtt.connect(MQTT_BROKER_URL, {
    protocol: "ws",
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  // Pass MQTT client to alarm controller for bidirectional communication
  alarmController.setMQTTClient(client);

  client.on("connect", () => {
    console.log("Connected to MQTT broker successfully");

    // Subscribe to scoped topics only
    const topics = ["capteurs/+", "alarme/+"];
    client.subscribe(topics, (err) => {
      if (err) {
        console.error("Failed to subscribe to topics:", err);
      } else {
        console.log(`Subscribed to MQTT topics: ${topics.join(", ")}`);
      }
    });
  });

  // Store latest temperature and humidity for thermal comfort calculation
  let latestTemperature = NaN;
  let latestHumidity = NaN;

  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const value = data.value;

      switch (topic) {
        case "capteurs/temperature":
          if (typeof value === "number") {
            temperatureController.updateCurrent(value);
            temperatureController.updateAverage(value);
            latestTemperature = value;

            // Update thermal comfort if we have both temperature and humidity
            if (!isNaN(latestHumidity)) {
              thermalComfortController.updateComfort(
                latestTemperature,
                latestHumidity,
              );
            }
          }
          break;

        case "capteurs/humidite":
          if (typeof value === "number") {
            humidityController.updateCurrent(value);
            humidityController.updateAverage(value);
            latestHumidity = value;

            // Update thermal comfort if we have both temperature and humidity
            if (!isNaN(latestTemperature)) {
              thermalComfortController.updateComfort(
                latestTemperature,
                latestHumidity,
              );
            }
          }
          break;

        case "capteurs/pression":
          if (typeof value === "number") {
            pressureController.updateCurrent(value);
            pressureController.updateAverage(value);
          }
          break;

        case "capteurs/son":
          if (typeof value === "number") {
            soundController.updateCurrent(value);
            soundController.updateAverage(value);
          }
          break;

        case "capteurs/lumiere":
          if (typeof value === "boolean") {
            lightController.updateCurrent(value);
            wasteAlertController.updateLightState(value);
          }
          break;

        case "capteurs/presence":
          if (typeof value === "boolean") {
            motionController.updateCurrent(value);
            wasteAlertController.updateMotionState(value);
          }
          break;

        case "alarme/mode":
          if (typeof value === "boolean") {
            alarmController.updateCurrent(value, false); // false = from MQTT, not frontend
            console.log(`Updated alarm mode: ${value ? "ACTIVE" : "INACTIVE"}`);
          }
          break;

        default:
          break;
      }
    } catch {
      console.log("Could not parse message as JSON or extract value");
    }
  });

  // Mock sensors (not physically connected yet)
  let mockTemperature = 22;
  let mockHumidity = 45;
  setInterval(() => {
    mockTemperature += (Math.random() - 0.5) * 0.5;
    mockTemperature = Math.max(18, Math.min(28, mockTemperature));
    const temp = Math.round(mockTemperature * 10) / 10;

    temperatureController.updateCurrent(temp);
    temperatureController.updateAverage(temp);
    latestTemperature = temp;

    mockHumidity += (Math.random() - 0.5) * 2;
    mockHumidity = Math.max(30, Math.min(70, mockHumidity));
    const hum = Math.round(mockHumidity * 10) / 10;

    humidityController.updateCurrent(hum);
    humidityController.updateAverage(hum);
    latestHumidity = hum;

    thermalComfortController.updateComfort(latestTemperature, latestHumidity);
  }, 10000);

  client.on("error", (error) => {
    console.error("MQTT Error:", error);
  });

  client.on("disconnect", () => {
    console.log("Disconnected from MQTT broker");
  });

  client.on("reconnect", () => {
    console.log("Attempting to reconnect to MQTT broker...");
  });

  client.on("offline", () => {
    console.log("MQTT client is offline");
  });

  return client;
}
