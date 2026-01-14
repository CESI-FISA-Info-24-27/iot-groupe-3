import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  effect,
  AfterViewInit,
  computed,
} from '@angular/core';
import { IonContent, IonRippleEffect } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TemperatureService } from 'src/app/shared/services/temperature-service';
import { HumidityService } from 'src/app/shared/services/humidity-service';
import { MotionService } from 'src/app/shared/services/motion-service';
import { LightService } from 'src/app/shared/services/light-service';
import { Chart, registerables } from 'chart.js';
import { DataSummaryComponent } from './data-summary/data-summary.component';
import {
  HumidityInfo,
  TemperatureInfo,
  MotionInfo,
  LightInfo,
} from 'src/app/shared/models/sensors.model';
import { ROOM_EVENT } from 'src/app/shared/models/events.model';
import { DatePipe } from '@angular/common';
import { DownloadService } from 'src/app/shared/services/download-service';

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

  temperatureService = inject(TemperatureService);
  humidityService = inject(HumidityService);
  motionService = inject(MotionService);
  lightService = inject(LightService);
  downloadService = inject(DownloadService);

  currentTemperature = computed(() => {
    const temps = this.temperatureService.temperatureValues();
    const last = temps.at(-1);
    return last ? Math.round(last.temperature) : NaN;
  });

  currentHumidity = computed(() => {
    const hums = this.humidityService.humidityValues();
    const last = hums.at(-1);
    return last ? Math.round(last.humidity) : NaN;
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
    const temps = this.temperatureService.temperatureValues();
    if (temps.length === 0) return 0;
    const sum = temps.reduce((acc, val) => acc + val.temperature, 0);
    return Math.round(sum / temps.length);
  });

  averageHumidity = computed(() => {
    const hums = this.humidityService.humidityValues();
    if (hums.length === 0) return 0;
    const sum = hums.reduce((acc, val) => acc + val.humidity, 0);
    return Math.round(sum / hums.length);
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
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return all.slice(0, 30);
  });
  temperatureChartInstance: Chart | null = null;
  humidityChartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const tempData = this.temperatureService.temperatureValues();
      const humidityData = this.humidityService.humidityValues();
      if (this.temperatureChartInstance) {
        this.updateTemperatureChart(tempData);
      }
      if (this.humidityChartInstance) {
        this.updateHumidityChart(humidityData);
      }
    });
  }

  ngAfterViewInit() {
    this.createTemperatureChart(this.temperatureService.temperatureValues());
    this.createHumidityChart(this.humidityService.humidityValues());
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  createTemperatureChart(
    temperatures: { temperature: number; timestamp: Date }[]
  ) {
    const labels = temperatures.map((t) => this.formatTimestamp(t.timestamp));
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
              data: temperatures.map((t) => t.temperature),
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
      }
    );
  }

  createHumidityChart(humidity: { humidity: number; timestamp: Date }[]) {
    const labels = humidity.map((h) => this.formatTimestamp(h.timestamp));
    const ctx = this.humidityChart.nativeElement.getContext('2d')!;
    const humidityGradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      0
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
            data: humidity.map((h) => h.humidity),
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
    const labels = temperatures.map((t) => this.formatTimestamp(t.timestamp));
    this.temperatureChartInstance.data.labels = labels;
    this.temperatureChartInstance.data.datasets[0].data = temperatures.map(
      (t) => t.temperature
    );
    this.temperatureChartInstance.update();
  }

  updateHumidityChart(humidity: HumidityInfo[]) {
    if (!this.humidityChartInstance) return;
    const labels = humidity.map((h) => this.formatTimestamp(h.timestamp));
    this.humidityChartInstance.data.labels = labels;
    this.humidityChartInstance.data.datasets[0].data = humidity.map(
      (h) => h.humidity
    );
    this.humidityChartInstance.update();
  }

  downloadCSV() {
    this.downloadService.downloadFile(
      'TEMP DATA',
      'CESIGuard-data-export.csv',
      'csv'
    );
  }
}
