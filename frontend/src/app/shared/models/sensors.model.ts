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
export interface CameraDetectionInfo {
  person_count: number;
  face_count: number;
  light_on: boolean;
  brightness: number;
  is_occupied: boolean;
  confidence: number;
  occupancy_rate: number;
  timestamp: Date;
}
