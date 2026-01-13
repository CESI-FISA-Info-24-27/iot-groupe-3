import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  temperatureValues = signal<number[]>([25]);

  constructor() {
    setInterval(() => {
      this.temperatureValues.update((t) =>
        [
          ...t,
          this.temperatureValues()[t.length - 1] + Math.random() * 4 - 2,
        ].slice(-20)
      );
    }, 5000);
  }
}
