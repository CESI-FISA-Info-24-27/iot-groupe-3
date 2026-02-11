import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BASE_BACKEND_URL } from '../models/request-parameters.model';
import { CameraDetectionInfo } from '../models/sensors.model';

interface DetectionResponse {
  status: string;
  detection: {
    person_count: number;
    face_count: number;
    light_on: boolean;
    brightness: number;
    is_occupied: boolean;
    confidence: number;
    occupancy_rate: number;
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  detectionInfo = signal<CameraDetectionInfo | null>({
    person_count: 2,
    face_count: 2,
    light_on: true,
    brightness: 75.5,
    is_occupied: true,
    confidence: 0.85,
    occupancy_rate: 45.2,
    timestamp: new Date(),
  });
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Mise à jour automatique toutes les 2 secondes
    interval(2000)
      .pipe(
        switchMap(() =>
          this.http.get<DetectionResponse>(`${BASE_BACKEND_URL}/camera/detection`)
        )
      )
      .subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            this.detectionInfo.set({
              person_count: response.detection.person_count,
              face_count: response.detection.face_count,
              light_on: response.detection.light_on,
              brightness: response.detection.brightness,
              is_occupied: response.detection.is_occupied,
              confidence: response.detection.confidence,
              occupancy_rate: response.detection.occupancy_rate,
              timestamp: new Date(response.detection.timestamp),
            });
            this.error.set(null);
          }
        },
        error: (err) => {
          console.error('Error fetching camera detection:', err);
          this.error.set('Impossible de récupérer les données de détection');
        },
      });
  }

  refreshDetection(): void {
    this.isLoading.set(true);
    this.http
      .get<DetectionResponse>(`${BASE_BACKEND_URL}/camera/detection`)
      .subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            this.detectionInfo.set({
              person_count: response.detection.person_count,
              face_count: response.detection.face_count,
              light_on: response.detection.light_on,
              brightness: response.detection.brightness,
              is_occupied: response.detection.is_occupied,
              confidence: response.detection.confidence,
              occupancy_rate: response.detection.occupancy_rate,
              timestamp: new Date(response.detection.timestamp),
            });
            this.error.set(null);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error refreshing camera detection:', err);
          this.error.set('Impossible de récupérer les données de détection');
          this.isLoading.set(false);
        },
      });
  }
}
