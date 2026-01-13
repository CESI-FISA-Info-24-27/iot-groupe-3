import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { StatusService } from '../../services/status-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonHeader, IonToolbar],
})
export class HeaderComponent {
  statusService = inject(StatusService);
  status = this.statusService.status;
  showText = signal<boolean>(false);
  private timeoutId?: ReturnType<typeof setTimeout>;

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
}
