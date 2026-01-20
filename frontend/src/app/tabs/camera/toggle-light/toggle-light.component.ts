import { Component, input } from '@angular/core';
import { LightInfo } from 'src/app/shared/models/sensors.model';

@Component({
  selector: 'app-toggle-light',
  templateUrl: './toggle-light.component.html',
  styleUrls: ['./toggle-light.component.scss'],
  imports: [],
})
export class ToggleLightComponent {
  lightState = input.required<LightInfo>();
}
