import { Injectable, signal } from '@angular/core';
import { MotionInfo } from '../models/sensors.model';

@Injectable({
  providedIn: 'root',
})
export class MotionService {
  motionValues = signal<MotionInfo[]>([]);

  constructor() {
    this.initializeMockData();
    this.startLiveUpdates();
  }

  private initializeMockData(): void {
    const now = new Date();
    const initialCount = Math.floor(Math.random() * 11) + 10; // 10-20 values
    const initialData: MotionInfo[] = [];

    for (let i = initialCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3000); // 3 seconds apart
      initialData.push({
        motionDetected: Math.random() > 0.7, // 30% chance of motion
        timestamp,
      });
    }

    this.motionValues.set(initialData);
  }

  private startLiveUpdates(): void {
    setInterval(() => {
      const newMotionState = Math.random() > 0.7; // 30% chance of motion
      const currentState = this.getCurrentMotionState();

      if (newMotionState !== currentState) {
        this.motionValues.update((values) => {
          const newValue: MotionInfo = {
            motionDetected: newMotionState,
            timestamp: new Date(),
          };
          return [...values, newValue].slice(-50); // Keep last 50 values
        });
      }
    }, 3000);
  }

  getCurrentMotionState(): boolean {
    const values = this.motionValues();
    return values.length > 0 ? values[values.length - 1].motionDetected : false;
  }
}
