import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IoT Sensor API",
      version: "1.0.0",
      description: "API documentation for CESIGuard backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        ValuePayload: {
          type: "object",
          properties: {
            value: {
              oneOf: [{ type: "number" }, { type: "boolean" }],
              description:
                "Sensor value (temperature in Celsius, humidity as percentage, light sensor state as boolean - true for light detected, motion detected as boolean)",
              example: 23.5,
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp of the reading",
            },
          },
        },
        SetValueRequest: {
          type: "object",
          required: ["value"],
          properties: {
            value: {
              type: "number",
              description:
                "Numeric value to set (temperature in Celsius, humidity as percentage)",
              example: 23.5,
            },
          },
        },
        SetMotionRequest: {
          type: "object",
          required: ["value"],
          properties: {
            value: {
              type: "boolean",
              description:
                "Boolean value to set (true for motion detected, false for no motion)",
              example: true,
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger documentation available at /api-docs");
};
