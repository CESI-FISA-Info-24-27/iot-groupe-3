import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline } from 'ionicons/icons';
import { StatusService } from '../../services/status-service';
import { STATUS } from '../../models/status.model';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonHeader, IonToolbar, IonIcon],
})
export class HeaderComponent {
  statusService = inject(StatusService);
  themeService = inject(ThemeService);
  status = this.statusService.status;
  showText = signal<boolean>(false);
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  toggleText(): void {
    this.showText.update((current) => !current);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this.showText()) {
      this.timeoutId = setTimeout(() => {
        this.showText.set(false);
        this.timeoutId = undefined;
      }, 6000);
    }
  }
  statusToClass(st: STATUS) {
    if (st === STATUS.OFFLINE) {
      return 'Offline';
    }
    if (st === STATUS.ONLINE) {
      return 'Online';
    }
    return 'Pending';
  }
}
