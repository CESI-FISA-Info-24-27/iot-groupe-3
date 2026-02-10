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
export interface PressureInfo {
  pressure: number;
  timestamp: Date;
}
export interface SoundInfo {
  sound: number;
  timestamp: Date;
}

export enum ThermalComfort {
  TOO_COLD_AND_DRY = "TOO_COLD_AND_DRY",
  TOO_COLD_AND_HUMID = "TOO_COLD_AND_HUMID",
  TOO_COLD = "TOO_COLD",
  COLD_AND_DRY = "COLD_AND_DRY",
  COLD_AND_HUMID = "COLD_AND_HUMID",
  COLD = "COLD",
  COMFORTABLE = "COMFORTABLE",
  WARM = "WARM",
  WARM_AND_DRY = "WARM_AND_DRY",
  WARM_AND_HUMID = "WARM_AND_HUMID",
  TOO_HOT = "TOO_HOT",
  TOO_HOT_AND_DRY = "TOO_HOT_AND_DRY",
  TOO_HOT_AND_HUMID = "TOO_HOT_AND_HUMID",
}

export interface ThermalComfortInfo {
  comfort: ThermalComfort;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export interface HiddenSensorsInfo {
  sensorsHidden: boolean;
  timestamp: Date;
}

export interface AlarmInfo {
  alarmActive: boolean;
  timestamp: Date;
}

export interface WasteAlertInfo {
  wasteDetected: boolean;
  timestamp: Date;
}
