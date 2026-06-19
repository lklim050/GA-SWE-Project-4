import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightModalComponent } from './insight-modal.component';

describe('InsightModalComponent', () => {
  let component: InsightModalComponent;
  let fixture: ComponentFixture<InsightModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InsightModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
