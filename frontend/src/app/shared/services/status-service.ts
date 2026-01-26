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
    this.checkBackendStatus();
    setInterval(() => {
      this.checkBackendStatus();
    }, 5000);
  }

  private checkBackendStatus(): void {
    this.http.get('http://localhost:3000/', { observe: 'response' }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.status.set(STATUS.ONLINE);
        } else {
          this.status.set(STATUS.OFFLINE);
        }
      },
    });
  }
}
