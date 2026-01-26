import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { STATUS } from '../models/status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private http = inject(HttpClient);

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
