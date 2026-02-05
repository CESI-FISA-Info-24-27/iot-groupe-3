import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { HiddenSensorsInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class HiddenSensorsService {
  hiddenSensorsValues = signal<HiddenSensorsInfo[]>([]);

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('hidden-sensors:current', (data: ValuePayload) => {
      this.hiddenSensorsValues.update((values) => [
        ...values,
        {
          sensorsHidden: data.value as boolean,
          timestamp: new Date(data.timestamp),
        },
      ]);
    });
  }
}
