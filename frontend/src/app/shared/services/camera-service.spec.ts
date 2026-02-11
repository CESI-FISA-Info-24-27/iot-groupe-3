import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CameraService } from './camera-service';

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CameraService],
    });
    service = TestBed.inject(CameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null detection info', () => {
    expect(service.detectionInfo()).toBeNull();
  });

  it('should not be loading initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should have no error initially', () => {
    expect(service.error()).toBeNull();
  });
});
