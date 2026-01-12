import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  temperatures = signal<number[]>([25]);

  constructor() {
    setInterval(() => {
      this.temperatures.update((t) =>
        [...t, this.temperatures()[t.length - 1] + Math.random() * 4 - 2].slice(
          -20
        )
      );
    }, 5000);
  }
}
