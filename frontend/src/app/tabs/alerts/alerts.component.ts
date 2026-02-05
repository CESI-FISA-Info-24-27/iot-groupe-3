import { Component, computed, inject } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { ThermalComfortService } from 'src/app/shared/services/thermal-comfort-service';
import { HiddenSensorsService } from 'src/app/shared/services/hidden-sensors-service';
import { AlarmService } from 'src/app/shared/services/alarm-service';
import { WasteAlertService } from 'src/app/shared/services/waste-alert-service';
import { ThermalComfort } from 'src/app/shared/models/sensors.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
  imports: [IonContent, IonButton, IonIcon, HeaderComponent],
})
export class AlertsComponent {
  private thermalComfortService = inject(ThermalComfortService);
  private hiddenSensorsService = inject(HiddenSensorsService);
  private alarmService = inject(AlarmService);
  private wasteAlertService = inject(WasteAlertService);

  thermalComfort = computed(
    () => this.thermalComfortService.thermalComfortValues().at(-1),
  );

  hiddenSensors = computed(
    () => this.hiddenSensorsService.hiddenSensorsValues().at(-1),
  );

  alarm = computed(() => this.alarmService.alarmValues().at(-1));

  wasteAlert = computed(() => this.wasteAlertService.wasteAlertValues().at(-1));

  sensorsHidden = computed(
    () => this.hiddenSensors()?.sensorsHidden,
  );

  alarmActive = computed(() => this.alarm()?.alarmActive);

  wasteDetected = computed(() => this.wasteAlert()?.wasteDetected);

  getThermalComfortLabel(comfort: ThermalComfort | undefined): string {
    if (!comfort) return 'Chargement...';

    const labels: Record<ThermalComfort, string> = {
      [ThermalComfort.TOO_COLD_AND_DRY]: 'Trop froid et sec',
      [ThermalComfort.TOO_COLD_AND_HUMID]: 'Trop froid et humide',
      [ThermalComfort.TOO_COLD]: 'Trop froid',
      [ThermalComfort.COLD_AND_DRY]: 'Froid et sec',
      [ThermalComfort.COLD_AND_HUMID]: 'Froid et humide',
      [ThermalComfort.COLD]: 'Froid',
      [ThermalComfort.COMFORTABLE]: 'Confortable',
      [ThermalComfort.WARM]: 'Chaud',
      [ThermalComfort.WARM_AND_DRY]: 'Chaud et sec',
      [ThermalComfort.WARM_AND_HUMID]: 'Chaud et humide',
      [ThermalComfort.TOO_HOT]: 'Trop chaud',
      [ThermalComfort.TOO_HOT_AND_DRY]: 'Trop chaud et sec',
      [ThermalComfort.TOO_HOT_AND_HUMID]: 'Trop chaud et humide',
    };

    return labels[comfort];
  }

  isComfortable(comfort: ThermalComfort | undefined): boolean {
    return comfort === ThermalComfort.COMFORTABLE;
  }

  toggleAlarm() {
    const currentState = this.alarmActive();
    if (currentState !== undefined) {
      this.alarmService.toggleAlarm(!currentState);
    }
  }

  getAlertState(value: boolean | undefined): 'ok' | 'warning' | 'pending' {
    if (value === undefined) return 'pending';
    return value ? 'warning' : 'ok';
  }

  getAlertIcon(value: boolean | undefined): string {
    if (value === undefined) return '?';
    return value ? '!' : '✓';
  }

  getSensorsLabel(hidden: boolean | undefined): string {
    if (hidden === undefined) return 'Chargement...';
    return hidden ? 'Capteurs cachés détectés' : 'Tous les capteurs visibles';
  }

  getAlarmLabel(active: boolean | undefined): string {
    if (active === undefined) return 'Chargement...';
    return active ? 'Alarme activée' : 'Alarme désactivée';
  }

  getWasteLabel(detected: boolean | undefined): string {
    if (detected === undefined) return 'Chargement...';
    return detected ? 'Gaspillage détecté' : 'Pas de gaspillage';
  }
}
