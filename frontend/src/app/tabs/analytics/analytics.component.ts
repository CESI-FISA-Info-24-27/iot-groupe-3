import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  effect,
  AfterViewInit,
  OnInit,
  computed,
} from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TemperatureService } from 'src/app/shared/services/temperature-service';
import { HumidityService } from 'src/app/shared/services/humidity-service';
import { Chart, registerables } from 'chart.js';
import { DataSummaryComponent } from './data-summary/data-summary.component';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [IonContent, HeaderComponent, DataSummaryComponent],
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('temperatureChart')
  temperatureChart!: ElementRef<HTMLCanvasElement>;

  temperatureService = inject(TemperatureService);
  humidityService = inject(HumidityService);

  currentTemperature = computed(() => {
    const temps = this.temperatureService.temperatureValues();
    return Math.round(temps.at(-1) ?? NaN);
  });

  currentHumidity = computed(() => {
    const hums = this.humidityService.humidityValues();
    return Math.round(hums.at(-1) ?? NaN);
  });

  averageTemperature = computed(() => {
    const temps = this.temperatureService.temperatureValues();
    if (temps.length === 0) return 0;
    const sum = temps.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / temps.length);
  });

  averageHumidity = computed(() => {
    const hums = this.humidityService.humidityValues();
    if (hums.length === 0) return 0;
    const sum = hums.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / hums.length);
  });
  chart: Chart | null = null;

  constructor() {
    effect(() => {
      const tempData = this.temperatureService.temperatureValues();
      const humidityData = this.humidityService.humidityValues();
      if (this.chart) {
        this.updateTemperatureHumidityChart(tempData, humidityData);
      }
    });
  }

  ngAfterViewInit() {
    this.createTemperatureHumidityChartChart(
      this.temperatureService.temperatureValues(),
      this.humidityService.humidityValues()
    );
  }

  createTemperatureHumidityChartChart(
    temperatures: number[],
    humidity: number[]
  ) {
    const maxLength = Math.max(temperatures.length, humidity.length);
    const labels = Array.from(
      { length: maxLength },
      (_, index) => `#${index + 1}`
    );

    const ctx = this.temperatureChart.nativeElement.getContext('2d')!;

    // Temperature gradient (blue to green)
    const tempGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    tempGradient.addColorStop(0, '#24c7d3');
    tempGradient.addColorStop(1, '#6dd55d');

    // Humidity gradient (orange to red)
    const humidityGradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      0
    );
    humidityGradient.addColorStop(0, '#f59e0b');
    humidityGradient.addColorStop(1, '#ef4444');

    this.chart = new Chart(this.temperatureChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: tempGradient,
            tension: 0.3,
            fill: false,
            backgroundColor: tempGradient,
            yAxisID: 'y',
          },
          {
            label: 'Humidity (%)',
            data: humidity,
            borderColor: humidityGradient,
            tension: 0.3,
            fill: false,
            backgroundColor: humidityGradient,
            yAxisID: 'y1',
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
              text: 'Temperature (°C)',
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Humidity (%)',
            },
            grid: {
              drawOnChartArea: false,
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

  updateTemperatureHumidityChart(temperatures: number[], humidity: number[]) {
    if (!this.chart) return;

    const maxLength = Math.max(temperatures.length, humidity.length);
    const labels = Array.from({ length: maxLength }, () =>
      new Date().toLocaleTimeString()
    );
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = temperatures;
    this.chart.data.datasets[1].data = humidity;
    this.chart.update();
  }
}
