import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DataSummaryComponent } from './data-summary.component';

describe('DataSummaryComponent', () => {
  let component: DataSummaryComponent;
  let fixture: ComponentFixture<DataSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DataSummaryComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DataSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
