import { Injectable, signal } from '@angular/core';
import { STATUS } from '../models/status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  status = signal<STATUS>(STATUS.OFFLINE);
  constructor() {
    setInterval(() => {
      const statuses = Object.values(STATUS);
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      this.status.set(randomStatus);
    }, 7000);
  }
}
