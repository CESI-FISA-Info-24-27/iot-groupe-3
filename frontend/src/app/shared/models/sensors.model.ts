export interface TemperatureInfo {
  temperature: number;
  timestamp: Date;
}
export interface MotionInfo {
  motionDetected: boolean;
  timestamp: Date;
}
export interface HumidityInfo {
  humidity: number;
  timestamp: Date;
}
export interface LightInfo {
  lightOn: boolean;
  timestamp: Date;
}
