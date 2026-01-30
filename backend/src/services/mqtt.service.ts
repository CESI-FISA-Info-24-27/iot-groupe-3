import mqtt from "mqtt";
import * as pressureController from "../controllers/pressure.controller";
import * as soundController from "../controllers/sound.controller";
import * as temperatureController from "../controllers/temperature.controller";

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

  client.on("message", (topic, message) => {
    console.log("\nMQTT Message Received:");
    console.log("  Topic:", topic);
    console.log("  Message:", message.toString());

    try {
      const data = JSON.parse(message.toString());
      const value = data.value;

      if (typeof value === "number") {
        switch (topic) {
          case "capteurs/temperature":
            temperatureController.updateCurrent(value);
            temperatureController.updateAverage(value);
            console.log(`Updated temperature: ${value}°C`);
            break;

          case "capteurs/pression":
            pressureController.updateCurrent(value);
            pressureController.updateAverage(value);
            console.log(`Updated pressure: ${value} hPa`);
            break;

          case "capteurs/son":
            soundController.updateCurrent(value);
            soundController.updateAverage(value);
            console.log(`Updated sound: ${value} dB`);
            break;

          default:
            console.log(`No handler for topic: ${topic}`);
        }
      }
    } catch (e) {
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
