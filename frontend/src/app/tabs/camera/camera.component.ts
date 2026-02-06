import { Component, computed, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { LightService } from 'src/app/shared/services/light-service';
import { MotionService } from 'src/app/shared/services/motion-service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
  imports: [IonContent, HeaderComponent, SpinnerComponent],
})
export class CameraComponent {
  streamUrl = 'https://camera.cesiguard.loicserre.fr/stream/complete';
  lightService = inject(LightService);
  motionService = inject(MotionService);
  streamLoaded = signal<boolean>(false);

  lightState = computed(
    () =>
      this.lightService.lightValues().at(-1) ?? {
        lightOn: false,
        timestamp: new Date(),
      },
  );

  motionState = computed(() => this.motionService.motionValues().at(-1));

  motionClass = computed(() =>
    this.motionState()?.motionDetected ? 'motion' : 'no-motion',
  );

  lightClass = computed(() =>
    this.lightState().lightOn ? 'light-on' : 'light-off',
  );

  constructor() {}

  onStreamLoad(): void {
    this.streamLoaded.set(true);
  }

  onStreamError(): void {
    this.streamLoaded.set(false);
  }
}
