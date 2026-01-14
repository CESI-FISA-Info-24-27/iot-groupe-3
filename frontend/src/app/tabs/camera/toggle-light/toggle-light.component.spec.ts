import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToggleLightComponent } from './toggle-light.component';

describe('ToggleLightComponent', () => {
  let component: ToggleLightComponent;
  let fixture: ComponentFixture<ToggleLightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToggleLightComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleLightComponent);
    component = fixture.componentInstance;
    // Fournir la valeur requise pour le model
    fixture.componentRef.setInput('lightState', false);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
