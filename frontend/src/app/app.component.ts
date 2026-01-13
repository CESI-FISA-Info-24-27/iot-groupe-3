import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  ellipse,
  gridOutline,
  moon,
  square,
  sunny,
  triangle,
  videocamOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Custom icons to be used anywhere in the app
    addIcons({
      analyticsOutline,
      triangle,
      ellipse,
      square,
      gridOutline,
      videocamOutline,
      sunny,
      moon,
    });
  }
}
