import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationReviewComponent } from './reservation-review.component';

describe('ReservationReviewComponent', () => {
  let component: ReservationReviewComponent;
  let fixture: ComponentFixture<ReservationReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
