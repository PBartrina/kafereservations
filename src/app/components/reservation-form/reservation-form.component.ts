import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService } from '../../services/mock-data.service';
import { DiningRegionConfig, TimeSlot } from '../../types/reservation.types';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ReservationFormComponent implements OnInit, OnDestroy {
  reservationForm!: FormGroup;
  diningRegions: DiningRegionConfig[] = [];
  timeSlots: TimeSlot[] = [];
  minDate = '2024-07-24';
  maxDate = '2024-07-31';
  isSubmitting = false;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private mockDataService: MockDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDiningRegions();
    this.loadTimeSlots();
    this.initForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.reservationForm = this.fb.group({
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      partySize: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(12)
      ]],
      region: ['', [Validators.required]],
      childrenCount: [0, [
        Validators.required,
        Validators.min(0)
      ]],
      smoking: [false],
      birthday: [false],
      birthdayName: ['']
    });
  }

  private setupFormValidation(): void {
    // Update birthday name validation based on birthday checkbox
    this.subscriptions.add(
      this.reservationForm.get('birthday')?.valueChanges.subscribe(hasBirthday => {
        const birthdayNameControl = this.reservationForm.get('birthdayName');
        if (birthdayNameControl) {
          if (hasBirthday) {
            birthdayNameControl.setValidators([Validators.required]);
          } else {
            birthdayNameControl.clearValidators();
          }
          birthdayNameControl.updateValueAndValidity();
        }
      })
    );

    // Update party size max based on selected region
    this.subscriptions.add(
      this.reservationForm.get('region')?.valueChanges.subscribe(regionId => {
        const region = this.diningRegions.find(r => r.id === regionId);
        if (region) {
          const partySizeControl = this.reservationForm.get('partySize');
          if (partySizeControl) {
            partySizeControl.setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(region.maxPartySize)
            ]);
            partySizeControl.updateValueAndValidity();
          }

          // Handle children restrictions
          const childrenCountControl = this.reservationForm.get('childrenCount');
          if (childrenCountControl) {
            if (!region.allowsChildren) {
              childrenCountControl.setValue(0);
              childrenCountControl.disable();
            } else {
              childrenCountControl.enable();
            }
          }

          // Handle smoking restrictions
          const smokingControl = this.reservationForm.get('smoking');
          if (smokingControl) {
            if (!region.allowsSmoking) {
              smokingControl.setValue(false);
              smokingControl.disable();
            } else {
              smokingControl.enable();
            }
          }
        }
      })
    );
  }

  private loadDiningRegions(): void {
    this.diningRegions = this.mockDataService.getDiningRegions();
  }

  private loadTimeSlots(): void {
    this.timeSlots = this.mockDataService.getTimeSlots();
  }

  onSubmit(): void {
    if (this.reservationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      // First check availability
      const formValue = this.reservationForm.value;
      const isAvailable = this.mockDataService.checkAvailability(
        formValue.date,
        formValue.time,
        formValue.region,
        formValue.partySize
      );

      if (isAvailable) {
        // Navigate to review page with form data
        this.router.navigate(['/review'], { 
          state: { formData: this.reservationForm.value }
        });
      } else {
        // Handle unavailability (we'll implement this later)
        console.log('Selected time slot is no longer available');
      }
      
      this.isSubmitting = false;
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reservationForm.controls).forEach(key => {
        const control = this.reservationForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Convenience getters for form fields
  get date() { return this.reservationForm.get('date'); }
  get time() { return this.reservationForm.get('time'); }
  get name() { return this.reservationForm.get('name'); }
  get email() { return this.reservationForm.get('email'); }
  get phone() { return this.reservationForm.get('phone'); }
  get partySize() { return this.reservationForm.get('partySize'); }
  get region() { return this.reservationForm.get('region'); }
  get childrenCount() { return this.reservationForm.get('childrenCount'); }
  get smoking() { return this.reservationForm.get('smoking'); }
  get birthday() { return this.reservationForm.get('birthday'); }
  get birthdayName() { return this.reservationForm.get('birthdayName'); }
}
