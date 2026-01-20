import { Injectable, signal } from '@angular/core';
import { HumidityInfo } from '../models/sensors.model';

@Injectable({
  providedIn: 'root',
})
export class HumidityService {
  humidityValues = signal<HumidityInfo[]>([]);

  constructor() {
    this.initializeMockData();
    this.startLiveUpdates();
  }

  private initializeMockData(): void {
    const now = new Date();
    const initialCount = Math.floor(Math.random() * 21) + 30; // 30-50 values
    const initialData: HumidityInfo[] = [];
    let lastHumidity = 40 + Math.random() * 20; // Start between 40-60%

    for (let i = initialCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5000); // 5 seconds apart
      lastHumidity = lastHumidity + Math.random() * 6 - 3; // Vary by ±3%
      lastHumidity = Math.max(20, Math.min(90, lastHumidity)); // Keep between 20-90%
      initialData.push({
        humidity: lastHumidity,
        timestamp,
      });
    }

    this.humidityValues.set(initialData);
  }

  private startLiveUpdates(): void {
    setInterval(() => {
      this.humidityValues.update((values) => {
        const lastHumidity =
          values.length > 0 ? values[values.length - 1].humidity : 50;
        const newHumidity = Math.max(
          20,
          Math.min(90, lastHumidity + Math.random() * 6 - 3),
        );
        const newValue: HumidityInfo = {
          humidity: newHumidity,
          timestamp: new Date(),
        };
        return [...values, newValue].slice(-50); // Keep last 50 values
      });
    }, 1000);
  }
}
