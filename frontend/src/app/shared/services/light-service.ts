import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { LightInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  lightValues = signal<LightInfo[]>([]);

  constructor(private http: HttpClient) {
    let socket = io(BASE_BACKEND_URL);

    socket.on('light:current', (newCurrentLight: ValuePayload) => {
      this.lightValues.update((values) => [
        ...values,
        {
          lightOn: newCurrentLight.value === 1,
          timestamp: new Date(newCurrentLight.timestamp),
        },
      ]);
    });
  }

  toggleLight(): void {
    this.http.post<ValuePayload>(`${BASE_BACKEND_URL}/light/toggle`, {});
  }

  getCurrentLightState(): boolean {
    const values = this.lightValues();
    return values.length > 0 ? values[values.length - 1].lightOn : false;
  }
}
