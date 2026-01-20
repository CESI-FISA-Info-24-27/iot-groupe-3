import { Injectable, signal } from '@angular/core';
import { TemperatureInfo } from '../models/sensors.model';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  temperatureValues = signal<TemperatureInfo[]>([]);

  constructor() {
    this.initializeMockData();
    this.startLiveUpdates();
  }

  private initializeMockData(): void {
    const now = new Date();
    const initialCount = Math.floor(Math.random() * 21) + 30; // 30-50 values
    const initialData: TemperatureInfo[] = [];
    let lastTemp = 22 + Math.random() * 6; // Start between 22-28°C

    for (let i = initialCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5000); // 5 seconds apart
      lastTemp = lastTemp + Math.random() * 4 - 2; // Vary by ±2°C
      lastTemp = Math.max(15, Math.min(35, lastTemp)); // Keep between 15-35°C
      initialData.push({
        temperature: lastTemp,
        timestamp,
      });
    }

    this.temperatureValues.set(initialData);
  }

  private startLiveUpdates(): void {
    setInterval(() => {
      this.temperatureValues.update((values) => {
        const lastTemp =
          values.length > 0 ? values[values.length - 1].temperature : 25;
        const newTemp = Math.max(
          15,
          Math.min(35, lastTemp + Math.random() * 4 - 2),
        );
        const newValue: TemperatureInfo = {
          temperature: newTemp,
          timestamp: new Date(),
        };
        return [...values, newValue].slice(-50); // Keep last 50 values
      });
    }, 5000);
  }
}
