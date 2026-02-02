import { Component, computed, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TemperatureService } from 'src/app/shared/services/temperature-service';
import { HumidityService } from 'src/app/shared/services/humidity-service';
import { MotionService } from 'src/app/shared/services/motion-service';
import { LightService } from 'src/app/shared/services/light-service';
import { PressureService } from 'src/app/shared/services/pressure-service';
import { SoundService } from 'src/app/shared/services/sound-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [IonContent, HeaderComponent],
})
export class DashboardComponent {
  private temperatureService = inject(TemperatureService);
  private humidityService = inject(HumidityService);
  private motionService = inject(MotionService);
  private lightService = inject(LightService);
  private pressureService = inject(PressureService);
  private soundService = inject(SoundService);

  currentTemperature = computed(
    () =>
      this.temperatureService.temperatureValues().at(-1)?.temperature?.toFixed(
        1,
      ) ?? '--',
  );

  currentHumidity = computed(
    () =>
      this.humidityService.humidityValues().at(-1)?.humidity?.toFixed(1) ??
      '--',
  );

  currentPressure = computed(
    () =>
      this.pressureService.pressureValues().at(-1)?.pressure?.toFixed(1) ??
      '--',
  );

  currentSound = computed(
    () =>
      this.soundService.soundValues().at(-1)?.sound?.toFixed(1) ?? '--',
  );

  motionState = computed(() => this.motionService.motionValues().at(-1));

  lightState = computed(
    () =>
      this.lightService.lightValues().at(-1) ?? {
        lightOn: false,
        timestamp: new Date(),
      },
  );

  motionDetected = computed(() => this.motionState()?.motionDetected ?? false);
}
