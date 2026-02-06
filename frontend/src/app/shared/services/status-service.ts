import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
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
    this.http.get(BASE_BACKEND_URL, { observe: 'response' }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.status.set(STATUS.ONLINE);
        } else {
          this.status.set(STATUS.OFFLINE);
        }
      },
      error: () => {
        this.status.set(STATUS.OFFLINE);
      },
    });
  }
}
