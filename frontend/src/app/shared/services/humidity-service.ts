import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HumidityService {
  humidityValues = signal<number[]>([50]);

  constructor() {
    setInterval(() => {
      this.humidityValues.update((t) => {
        const lastValue = t[t.length - 1];
        const newValue = Math.min(
          100,
          Math.max(0, lastValue + Math.random() * 20 - 10)
        );
        return [...t, newValue].slice(-20);
      });
    }, 2000);
  }
}
