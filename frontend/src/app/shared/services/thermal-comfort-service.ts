import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { ThermalComfortInfo } from '../models/sensors.model';

@Injectable({
  providedIn: 'root',
})
export class ThermalComfortService {
  thermalComfortValues = signal<ThermalComfortInfo[]>([]);

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('thermal-comfort:current', (data: ThermalComfortInfo) => {
      this.thermalComfortValues.update((values) => [
        ...values,
        {
          comfort: data.comfort,
          temperature: data.temperature,
          humidity: data.humidity,
          timestamp: new Date(data.timestamp),
        },
      ]);
    });
  }
}
