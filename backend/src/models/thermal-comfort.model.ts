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

export interface ThermalComfortPayload {
  comfort: ThermalComfort;
  temperature: number;
  humidity: number;
  timestamp: Date;
}
