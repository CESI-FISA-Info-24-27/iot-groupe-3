import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  lightState = signal<boolean>(false);
  constructor() {
    setInterval(() => {
      this.lightState.set(Math.random() < 0.5);
    }, 8000);
  }
}
