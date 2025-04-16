import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReservationFormComponent } from './reservation-form.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockDataService } from '../../services/mock-data.service';
import { Router } from '@angular/router';
import { DiningRegionConfig, DiningRegion } from '../../types/reservation.types';

describe('ReservationFormComponent', () => {
  let component: ReservationFormComponent;
  let fixture: ComponentFixture<ReservationFormComponent>;
  let mockDataService: jasmine.SpyObj<MockDataService>;
  let router: jasmine.SpyObj<Router>;

  const mockDiningRegions: DiningRegionConfig[] = [
    { 
      id: 'riverside' as DiningRegion, 
      name: 'Riverside', 
      maxPartySize: 8, 
      maxCapacity: 32,
      allowsChildren: true, 
      allowsSmoking: true 
    },
    { 
      id: 'main-hall' as DiningRegion, 
      name: 'Main Hall', 
      maxPartySize: 12, 
      maxCapacity: 48,
      allowsChildren: true, 
      allowsSmoking: false 
    }
  ];

  const mockTimeSlots = [
    { time: '18:00', available: true },
    { time: '19:00', available: true }
  ];

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('MockDataService', [
      'getDiningRegions',
      'getTimeSlots',
      'checkAvailability'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);

    mockDataService.getDiningRegions.and.returnValue(mockDiningRegions);
    mockDataService.getTimeSlots.and.returnValue(mockTimeSlots);
    mockDataService.checkAvailability.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        ReservationFormComponent
      ],
      providers: [
        { provide: MockDataService, useValue: mockDataService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.reservationForm.get('date')?.value).toBe('');
    expect(component.reservationForm.get('time')?.value).toBe('');
    expect(component.reservationForm.get('name')?.value).toBe('');
    expect(component.reservationForm.get('email')?.value).toBe('');
    expect(component.reservationForm.get('phone')?.value).toBe('');
    expect(component.reservationForm.get('partySize')?.value).toBe(1);
    expect(component.reservationForm.get('region')?.value).toBe('');
    expect(component.reservationForm.get('childrenCount')?.value).toBe(0);
    expect(component.reservationForm.get('smoking')?.value).toBe(false);
    expect(component.reservationForm.get('birthday')?.value).toBe(false);
    expect(component.reservationForm.get('birthdayName')?.value).toBe('');
  });

  it('should load dining regions and time slots on init', () => {
    expect(mockDataService.getDiningRegions).toHaveBeenCalled();
    expect(mockDataService.getTimeSlots).toHaveBeenCalled();
    expect(component.diningRegions).toEqual(mockDiningRegions);
    expect(component.timeSlots).toEqual(mockTimeSlots.map(slot => slot.time));
  });

  it('should validate required fields', () => {
    const form = component.reservationForm;
    expect(form.valid).toBeFalsy();

    // Fill in required fields
    form.patchValue({
      date: '2024-07-24',
      time: '18:00',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      partySize: 2,
      region: 'riverside' as DiningRegion
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.reservationForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should validate phone number format', () => {
    const phoneControl = component.reservationForm.get('phone');
    phoneControl?.setValue('123');
    expect(phoneControl?.errors?.['pattern']).toBeTruthy();

    phoneControl?.setValue('1234567890');
    expect(phoneControl?.errors).toBeNull();
  });

  it('should update birthdayName validation when birthday is checked', () => {
    const birthdayControl = component.reservationForm.get('birthday');
    const birthdayNameControl = component.reservationForm.get('birthdayName');

    birthdayControl?.setValue(true);
    expect(birthdayNameControl?.hasValidator(Validators.required)).toBeTruthy();

    birthdayControl?.setValue(false);
    expect(birthdayNameControl?.hasValidator(Validators.required)).toBeFalsy();
  });

  it('should update party size validation based on selected region', () => {
    const regionControl = component.reservationForm.get('region');
    const partySizeControl = component.reservationForm.get('partySize');

    regionControl?.setValue('riverside' as DiningRegion);
    expect(partySizeControl?.errors?.['max']).toBeFalsy();

    partySizeControl?.setValue(10);
    expect(partySizeControl?.errors?.['max']).toBeTruthy();
  });

  it('should handle form submission when valid', fakeAsync(() => {
    const formValue = {
      date: '2024-07-24',
      time: '18:00',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      partySize: 2,
      region: 'riverside' as DiningRegion,
      childrenCount: 0,
      smoking: false,
      birthday: false,
      birthdayName: ''
    };

    component.reservationForm.patchValue(formValue);
    component.onSubmit();
    tick();

    expect(mockDataService.checkAvailability).toHaveBeenCalledWith(
      formValue.date,
      formValue.time,
      formValue.region,
      formValue.partySize
    );

    expect(router.navigate).toHaveBeenCalledWith(
      ['/review'],
      { state: { formData: formValue } }
    );
  }));

  it('should handle unavailable time slots', fakeAsync(() => {
    mockDataService.checkAvailability.and.returnValue(false);
    spyOn(console, 'log');

    component.reservationForm.patchValue({
      date: '2024-07-24',
      time: '18:00',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      partySize: 2,
      region: 'riverside' as DiningRegion
    });

    component.onSubmit();
    tick();

    expect(console.log).toHaveBeenCalledWith('Selected time slot is no longer available');
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
