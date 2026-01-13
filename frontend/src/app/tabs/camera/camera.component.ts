import { Component, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { ToggleLightComponent } from './toggle-light/toggle-light.component';
import { LightService } from 'src/app/shared/services/light-service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    SpinnerComponent,
    ToggleLightComponent,
  ],
})
export class CameraComponent {
  streamUrl = 'http://77.222.181.11:8080/mjpg/video.mjpg';
  lightService = inject(LightService);
  streamLoaded = signal<boolean>(false);
  lightState = this.lightService.lightState;

  onStreamLoad(): void {
    this.streamLoaded.set(true);
  }

  onStreamError(): void {
    this.streamLoaded.set(false);
  }
}
