import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { WasteAlertInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class WasteAlertService {
  wasteAlertValues = signal<WasteAlertInfo[]>([]);

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('waste-alert:current', (data: ValuePayload) => {
      this.wasteAlertValues.update((values) => [
        ...values,
        {
          wasteDetected: data.value as boolean,
          timestamp: new Date(data.timestamp),
        },
      ]);
    });
  }
}
