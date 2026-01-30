import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { HumidityInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class HumidityService {
  humidityValues = signal<HumidityInfo[]>([]);
  averageRoomHumidity = signal<HumidityInfo>({
    humidity: NaN,
    timestamp: new Date(),
  });

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('humidity:current', (newCurrentHumidity: ValuePayload) => {
      this.humidityValues.update((values) => [
        ...values,
        {
          humidity: newCurrentHumidity.value as number,
          timestamp: new Date(newCurrentHumidity.timestamp),
        },
      ]);
    });

    socket.on('humidity:average', (newAverageHumidity: ValuePayload) => {
      this.averageRoomHumidity.set({
        humidity: newAverageHumidity.value as number,
        timestamp: new Date(newAverageHumidity.timestamp),
      });
    });
  }
}
