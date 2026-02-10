import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { IonContent, IonRippleEffect } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { ROOM_EVENT } from 'src/app/shared/models/events.model';
import {
  HumidityInfo,
  LightInfo,
  MotionInfo,
  TemperatureInfo,
  PressureInfo,
  SoundInfo,
} from 'src/app/shared/models/sensors.model';
import { DownloadService } from 'src/app/shared/services/download-service';
import { HumidityService } from 'src/app/shared/services/humidity-service';
import { LightService } from 'src/app/shared/services/light-service';
import { MotionService } from 'src/app/shared/services/motion-service';
import { TemperatureService } from 'src/app/shared/services/temperature-service';
import { PressureService } from 'src/app/shared/services/pressure-service';
import { SoundService } from 'src/app/shared/services/sound-service';
import { DataSummaryComponent } from './data-summary/data-summary.component';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    DataSummaryComponent,
    DatePipe,
    IonRippleEffect,
  ],
})
export class AnalyticsComponent {
  @ViewChild('temperatureChart')
  temperatureChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityChart')
  humidityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pressureChart')
  pressureChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('soundChart')
  soundChart!: ElementRef<HTMLCanvasElement>;

  temperatureService = inject(TemperatureService);
  humidityService = inject(HumidityService);
  motionService = inject(MotionService);
  lightService = inject(LightService);
  pressureService = inject(PressureService);
  soundService = inject(SoundService);
  downloadService = inject(DownloadService);

  currentTemperature = computed(() => {
    const temps = this.temperatureService.temperatureValues();
    const last = temps.at(-1);
    return last ? Number(last.temperature.toFixed(1)) : NaN;
  });

  currentHumidity = computed(() => {
    const hums = this.humidityService.humidityValues();
    const last = hums.at(-1);
    return last ? Number(last.humidity.toFixed(1)) : NaN;
  });

  currentPressure = computed(() => {
    const pressures = this.pressureService.pressureValues();
    const last = pressures.at(-1);
    return last ? Number(last.pressure.toFixed(1)) : NaN;
  });

  currentSound = computed(() => {
    const sounds = this.soundService.soundValues();
    const last = sounds.at(-1);
    return last ? Number(last.sound.toFixed(1)) : NaN;
  });

  lastTemperatureUpdate = computed(() => {
    const temps = this.temperatureService.temperatureValues();
    return temps.at(-1)?.timestamp ?? null;
  });

  lastHumidityUpdate = computed(() => {
    const hums = this.humidityService.humidityValues();
    return hums.at(-1)?.timestamp ?? null;
  });

  averageTemperature = computed(() => {
    const temperature = this.temperatureService.averageRoomTemperature().temperature;
    return Number(temperature.toFixed(1));
  });

  averageHumidity = computed(() => {
    const humidity = this.humidityService.averageRoomHumidity().humidity;
    return Number(humidity.toFixed(1));
  });

  averagePressure = computed(() => {
    const pressure = this.pressureService.averageRoomPressure().pressure;
    return Number(pressure.toFixed(1));
  });

  averageSound = computed(() => {
    const sound = this.soundService.averageRoomSound().sound;
    return Number(sound.toFixed(1));
  });

  // 30 most recent events from motion and light sensors
  lastEvents = computed(() => {
    const motionEvents = this.motionService
      .motionValues()
      .map((m: MotionInfo) => ({
        type: m.motionDetected
          ? ROOM_EVENT.MOTION_DETECTED
          : ROOM_EVENT.NO_MOTION_DETECTED,
        timestamp: m.timestamp,
      }));
    const lightEvents = this.lightService.lightValues().map((l: LightInfo) => ({
      type: l.lightOn ? ROOM_EVENT.LIGHT_ON : ROOM_EVENT.LIGHT_OFF,
      timestamp: l.timestamp,
    }));
    const all = [...motionEvents, ...lightEvents];
    all.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const deduplicated = all.filter(
      (event, index) => index === 0 || all[index - 1].type !== event.type,
    );
    return deduplicated.slice(0, 30);
  });
  temperatureChartInstance: Chart | null = null;
  humidityChartInstance: Chart | null = null;
  pressureChartInstance: Chart | null = null;
  soundChartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const tempData = this.temperatureService.temperatureValues();
      const humidityData = this.humidityService.humidityValues();
      const pressureData = this.pressureService.pressureValues();
      const soundData = this.soundService.soundValues();
      if (this.temperatureChartInstance) {
        this.updateTemperatureChart(tempData);
      }
      if (this.humidityChartInstance) {
        this.updateHumidityChart(humidityData);
      }
      if (this.pressureChartInstance) {
        this.updatePressureChart(pressureData);
      }
      if (this.soundChartInstance) {
        this.updateSoundChart(soundData);
      }
    });
  }

  ngAfterViewInit() {
    this.createTemperatureChart(this.temperatureService.temperatureValues());
    this.createHumidityChart(this.humidityService.humidityValues());
    this.createPressureChart(this.pressureService.pressureValues());
    this.createSoundChart(this.soundService.soundValues());
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  createTemperatureChart(
    temperatures: { temperature: number; timestamp: Date }[],
  ) {
    const last50 = temperatures.slice(-50);
    const labels = last50.map((t) => this.formatTimestamp(t.timestamp));
    const ctx = this.temperatureChart.nativeElement.getContext('2d')!;
    const tempGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    tempGradient.addColorStop(0, '#24c7d3');
    tempGradient.addColorStop(1, '#6dd55d');
    this.temperatureChartInstance = new Chart(
      this.temperatureChart.nativeElement,
      {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Température (°C)',
              data: last50.map((t) => Number(t.temperature.toFixed(1))),
              borderColor: tempGradient,
              tension: 0.3,
              fill: false,
              backgroundColor: tempGradient,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            point: { radius: 0 },
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Température (°C)',
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 14,
                },
                boxWidth: 20,
                boxHeight: 20,
              },
            },
          },
        },
      },
    );
  }

  createHumidityChart(humidity: { humidity: number; timestamp: Date }[]) {
    const last50 = humidity.slice(-50);
    const labels = last50.map((h) => this.formatTimestamp(h.timestamp));
    const ctx = this.humidityChart.nativeElement.getContext('2d')!;
    const humidityGradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      0,
    );
    humidityGradient.addColorStop(0, '#f59e0b');
    humidityGradient.addColorStop(1, '#ef4444');
    this.humidityChartInstance = new Chart(this.humidityChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Humidité (%)',
            data: last50.map((h) => Number(h.humidity.toFixed(1))),
            borderColor: humidityGradient,
            tension: 0.3,
            fill: false,
            backgroundColor: humidityGradient,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: { radius: 0 },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Humidité (%)',
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14,
              },
              boxWidth: 20,
              boxHeight: 20,
            },
          },
        },
      },
    });
  }

  updateTemperatureChart(temperatures: TemperatureInfo[]) {
    if (!this.temperatureChartInstance) return;
    const last50 = temperatures.slice(-50);
    const labels = last50.map((t) => this.formatTimestamp(t.timestamp));
    this.temperatureChartInstance.data.labels = labels;
    this.temperatureChartInstance.data.datasets[0].data = last50.map(
      (t) => Number(t.temperature.toFixed(1)),
    );
    this.temperatureChartInstance.update();
  }

  updateHumidityChart(humidity: HumidityInfo[]) {
    if (!this.humidityChartInstance) return;
    const last50 = humidity.slice(-50);
    const labels = last50.map((h) => this.formatTimestamp(h.timestamp));
    this.humidityChartInstance.data.labels = labels;
    this.humidityChartInstance.data.datasets[0].data = last50.map(
      (h) => Number(h.humidity.toFixed(1)),
    );
    this.humidityChartInstance.update();
  }

  createPressureChart(pressures: { pressure: number; timestamp: Date }[]) {
    const last50 = pressures.slice(-50);
    const labels = last50.map((p) => this.formatTimestamp(p.timestamp));
    const ctx = this.pressureChart.nativeElement.getContext('2d')!;
    const pressureGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    pressureGradient.addColorStop(0, '#8b5cf6');
    pressureGradient.addColorStop(1, '#ec4899');
    this.pressureChartInstance = new Chart(this.pressureChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Pression (hPa)',
            data: last50.map((p) => Number(p.pressure.toFixed(1))),
            borderColor: pressureGradient,
            tension: 0.3,
            fill: false,
            backgroundColor: pressureGradient,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: { radius: 0 },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Pression (hPa)',
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14,
              },
              boxWidth: 20,
              boxHeight: 20,
            },
          },
        },
      },
    });
  }

  updatePressureChart(pressures: PressureInfo[]) {
    if (!this.pressureChartInstance) return;
    const last50 = pressures.slice(-50);
    const labels = last50.map((p) => this.formatTimestamp(p.timestamp));
    this.pressureChartInstance.data.labels = labels;
    this.pressureChartInstance.data.datasets[0].data = last50.map(
      (p) => Number(p.pressure.toFixed(1)),
    );
    this.pressureChartInstance.update();
  }

  createSoundChart(sounds: { sound: number; timestamp: Date }[]) {
    const last50 = sounds.slice(-50);
    const labels = last50.map((s) => this.formatTimestamp(s.timestamp));
    const ctx = this.soundChart.nativeElement.getContext('2d')!;
    const soundGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    soundGradient.addColorStop(0, '#06b6d4');
    soundGradient.addColorStop(1, '#3b82f6');
    this.soundChartInstance = new Chart(this.soundChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Son (dB)',
            data: last50.map((s) => Number(s.sound.toFixed(1))),
            borderColor: soundGradient,
            tension: 0.3,
            fill: false,
            backgroundColor: soundGradient,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: { radius: 0 },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Son (dB)',
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14,
              },
              boxWidth: 20,
              boxHeight: 20,
            },
          },
        },
      },
    });
  }

  updateSoundChart(sounds: SoundInfo[]) {
    if (!this.soundChartInstance) return;
    const last50 = sounds.slice(-50);
    const labels = last50.map((s) => this.formatTimestamp(s.timestamp));
    this.soundChartInstance.data.labels = labels;
    this.soundChartInstance.data.datasets[0].data = last50.map(
      (s) => Number(s.sound.toFixed(1)),
    );
    this.soundChartInstance.update();
  }

  downloadCSV() {
    this.downloadService.downloadFile(
      'TEMP DATA',
      'CESIGuard-data-export.csv',
      'csv',
    );
  }
}
