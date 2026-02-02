import { Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { SoundInfo } from '../models/sensors.model';
import { ValuePayload } from '../models/value-payload';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  soundValues = signal<SoundInfo[]>([]);
  averageRoomSound = signal<SoundInfo>({
    sound: NaN,
    timestamp: new Date(),
  });

  constructor() {
    let socket = io(BASE_BACKEND_URL);

    socket.on('sound:current', (newCurrentSound: ValuePayload) => {
      this.soundValues.update((values) => [
        ...values,
        {
          sound: newCurrentSound.value as number,
          timestamp: new Date(newCurrentSound.timestamp),
        },
      ]);
    });

    socket.on('sound:average', (newAverageSound: ValuePayload) => {
      this.averageRoomSound.set({
        sound: newAverageSound.value as number,
        timestamp: new Date(newAverageSound.timestamp),
      });
    });
  }
}
