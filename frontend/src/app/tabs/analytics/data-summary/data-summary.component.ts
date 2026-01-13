import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-summary',
  templateUrl: './data-summary.component.html',
  styleUrls: ['./data-summary.component.scss'],
})
export class DataSummaryComponent {
  currentTemperature = input<number>(NaN);
  currentHumidity = input<number>(NaN);
  averageTemperature = input<number>(NaN);
  averageHumidity = input<number>(NaN);
}
