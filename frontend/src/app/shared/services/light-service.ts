import { effect, Injectable, signal } from '@angular/core';
import { LightInfo } from '../models/sensors.model';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  lightValues = signal<LightInfo[]>([]);

  constructor() {
    this.initializeMockData();
    this.startLiveUpdates();
  }

  private startLiveUpdates(): void {
    setInterval(() => {
      const shouldToggle = Math.random() > 0.7; // 30% chance of toggle

      if (shouldToggle) {
        this.lightValues.update((values) => {
          const lastState =
            values.length > 0 ? values[values.length - 1].lightOn : false;
          const newValue: LightInfo = {
            lightOn: !lastState,
            timestamp: new Date(),
          };
          return [...values, newValue].slice(-50); // Keep last 50 values
        });
      }
    }, 3000);
  }

  private initializeMockData(): void {
    const now = new Date();
    const initialCount = Math.floor(Math.random() * 11) + 10; // 10-20 values
    const initialData: LightInfo[] = [];
    let lightState = false;

    for (let i = initialCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3000); // 3 seconds apart
      if (Math.random() > 0.7) {
        lightState = !lightState; // 30% chance of toggle
      }
      initialData.push({
        lightOn: lightState,
        timestamp,
      });
    }

    this.lightValues.set(initialData);
  }

  toggleLight(): void {
    this.lightValues.update((values) => {
      const lastState =
        values.length > 0 ? values[values.length - 1].lightOn : false;
      const newValue: LightInfo = {
        lightOn: !lastState,
        timestamp: new Date(),
      };
      return [...values, newValue].slice(-50); // Keep last 50 values
    });
  }

  getCurrentLightState(): boolean {
    const values = this.lightValues();
    return values.length > 0 ? values[values.length - 1].lightOn : false;
  }
}
