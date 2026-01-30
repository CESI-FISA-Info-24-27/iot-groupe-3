import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { MotionInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class MotionService {
  motionValues = signal<MotionInfo[]>([]);

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('motion:current', (newCurrentMotion: ValuePayload) => {
      this.motionValues.update((values) => [
        ...values,
        {
          motionDetected: newCurrentMotion.value as boolean,
          timestamp: new Date(newCurrentMotion.timestamp),
        },
      ]);
    });
  }

  getCurrentMotionState(): boolean {
    const values = this.motionValues();
    return values.length > 0 ? values[values.length - 1].motionDetected : false;
  }
}
