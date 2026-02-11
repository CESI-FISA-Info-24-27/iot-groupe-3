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

    // Subscribe to all topics using the wildcard '#'
    client.subscribe("#", (err) => {
      if (err) {
        console.error("Failed to subscribe to topics :", err);
      } else {
        console.log("Subscribed to all MQTT topics");
      }
    });
  });

  // Store latest temperature and humidity for thermal comfort calculation
  let latestTemperature = NaN;
  let latestHumidity = NaN;

  client.on("message", (topic, message) => {
    console.log("\nMQTT Message Received:");
    console.log("  Topic:", topic);
    console.log("  Message:", message.toString());

    try {
      const data = JSON.parse(message.toString());
      const value = data.value;

      switch (topic) {
        case "capteurs/temperature":
          if (typeof value === "number") {
            temperatureController.updateCurrent(value);
            temperatureController.updateAverage(value);
            latestTemperature = value;
            console.log(`Updated temperature: ${value}°C`);

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
            console.log(`Updated humidity: ${value}%`);

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
            console.log(`Updated pressure: ${value} hPa`);
          }
          break;

        case "capteurs/son":
          if (typeof value === "number") {
            soundController.updateCurrent(value);
            soundController.updateAverage(value);
            console.log(`Updated sound: ${value} dB`);
          }
          break;

        case "capteurs/lumiere":
          if (typeof value === "boolean") {
            lightController.updateCurrent(value);
            wasteAlertController.updateLightState(value);
            console.log(`Updated light: ${value ? "ON" : "OFF"}`);
          }
          break;

        case "capteurs/presence":
          if (typeof value === "boolean") {
            motionController.updateCurrent(value);
            wasteAlertController.updateMotionState(value);
            console.log(`Updated motion: ${value ? "DETECTED" : "NONE"}`);
          }
          break;

        case "alarme/mode":
          if (typeof value === "boolean") {
            alarmController.updateCurrent(value, false); // false = from MQTT, not frontend
            console.log(`Updated alarm mode: ${value ? "ACTIVE" : "INACTIVE"}`);
          }
          break;

        default:
          console.log(`No handler for topic: ${topic}`);
      }
    } catch {
      console.log("Could not parse message as JSON or extract value");
    }
  });

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
