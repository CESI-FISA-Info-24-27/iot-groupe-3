import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { TemperatureInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  temperatureValues = signal<TemperatureInfo[]>([]);
  averageRoomTemperature = signal<TemperatureInfo>({
    temperature: NaN,
    timestamp: new Date(),
  });

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('temperature:current', (newCurrentTemperature: ValuePayload) => {
      this.temperatureValues.update((values) => [
        ...values,
        {
          temperature: newCurrentTemperature.value,
          timestamp: new Date(newCurrentTemperature.timestamp),
        },
      ]);
    });

    socket.on('temperature:average', (newAverageTemperature: ValuePayload) => {
      this.averageRoomTemperature.set({
        temperature: newAverageTemperature.value,
        timestamp: new Date(newAverageTemperature.timestamp),
      });
    });
  }
}
