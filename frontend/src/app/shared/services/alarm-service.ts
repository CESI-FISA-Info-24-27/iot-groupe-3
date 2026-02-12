import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { AlarmInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class AlarmService {
  alarmValues = signal<AlarmInfo[]>([]);
  alarmRinging = signal<boolean>(false);
  private socket: Socket;

  constructor() {
    this.socket = io(BASE_BACKEND_URL);

    this.socket.on('alarm:current', (data: ValuePayload) => {
      this.alarmValues.update((values) => [
        ...values,
        {
          alarmActive: data.value as boolean,
          timestamp: new Date(data.timestamp),
        },
      ]);
    });
    this.socket.on('alarm:ringing', (data: ValuePayload) => {
      this.alarmRinging.set(data.value as boolean);
    });
  }

  toggleAlarm(value: boolean) {
    this.socket.emit('alarm:toggle', { value });
  }
}