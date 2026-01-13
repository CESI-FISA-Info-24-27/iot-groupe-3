import { Component, model } from '@angular/core';

@Component({
  selector: 'app-toggle-light',
  templateUrl: './toggle-light.component.html',
  styleUrls: ['./toggle-light.component.scss'],
  imports: [],
})
export class ToggleLightComponent {
  lightState = model.required<boolean>();

  toggleLight(): void {
    this.lightState.set(!this.lightState());
  }
}
