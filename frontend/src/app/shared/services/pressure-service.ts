import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { PressureInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class PressureService {
  pressureValues = signal<PressureInfo[]>([]);
  averageRoomPressure = signal<PressureInfo>({
    pressure: NaN,
    timestamp: new Date(),
  });

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('pressure:current', (newCurrentPressure: ValuePayload) => {
      this.pressureValues.update((values) => [
        ...values,
        {
          pressure: newCurrentPressure.value as number,
          timestamp: new Date(newCurrentPressure.timestamp),
        },
      ]);
    });

    socket.on('pressure:average', (newAveragePressure: ValuePayload) => {
      this.averageRoomPressure.set({
        pressure: newAveragePressure.value as number,
        timestamp: new Date(newAveragePressure.timestamp),
      });
    });
  }
}
