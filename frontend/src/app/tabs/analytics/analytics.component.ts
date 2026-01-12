import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  effect,
  AfterViewInit,
} from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TemperatureService } from 'src/app/shared/services/temperature-service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [IonContent, HeaderComponent],
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('temperatureChart')
  temperatureChart!: ElementRef<HTMLCanvasElement>;

  temperatureService = inject(TemperatureService);
  chart: Chart | null = null;

  constructor() {
    effect(() => {
      const data = this.temperatureService.temperatures();
      if (this.chart && data) {
        this.updateChart(data);
      }
    });
  }
  ngAfterViewInit() {
    this.createChart(this.temperatureService.temperatures());
  }

  createChart(temperatures: number[]) {
    const labels = temperatures.map((_, index) => `#${index + 1}`);

    this.chart = new Chart(this.temperatureChart.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: '#24c7d3',
            tension: 0.3,
            fill: false,
            backgroundColor: '#24c7d3',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: { radius: 0 },
        },
      },
    });
  }

  updateChart(temperatures: number[]) {
    if (!this.chart) return;

    const labels = temperatures.map((_, index) => `#${index + 1}`);
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = temperatures;
    this.chart.update();
  }
}
