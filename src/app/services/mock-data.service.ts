import { Injectable } from '@angular/core';
import { DiningRegion, DiningRegionConfig, Reservation, TimeSlot } from '../types/reservation.types';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private reservations: Reservation[] = [];

  private readonly diningRegions: DiningRegionConfig[] = [
    {
      id: 'main-hall',
      name: 'Main Hall',
      maxPartySize: 12,
      maxCapacity: 48, // Can fit 4 large tables of 12
      allowsChildren: true,
      allowsSmoking: false
    },
    {
      id: 'bar',
      name: 'Bar',
      maxPartySize: 4,
      maxCapacity: 12, // Can fit 3 tables of 4, small to test full capacity
      allowsChildren: false,
      allowsSmoking: false
    },
    {
      id: 'riverside',
      name: 'Riverside',
      maxPartySize: 8,
      maxCapacity: 24, // Can fit 3 tables of 8
      allowsChildren: true,
      allowsSmoking: false
    },
    {
      id: 'riverside-smoking',
      name: 'Riverside (Smoking)',
      maxPartySize: 6,
      maxCapacity: 12, // Can fit 2 tables of 6, small to test full capacity
      allowsChildren: false,
      allowsSmoking: true
    }
  ];

  constructor() {}

  getDiningRegions(): DiningRegionConfig[] {
    return this.diningRegions;
  }

  getDiningRegion(id: DiningRegion): DiningRegionConfig | undefined {
    return this.diningRegions.find(region => region.id === id);
  }

  getTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    // From 6 PM (18:00) to 10 PM (22:00)
    for (let hour = 18; hour <= 22; hour++) {
      slots.push({ time: `${hour}:00`, available: true });
      if (hour < 22) {
        slots.push({ time: `${hour}:30`, available: true });
      }
    }
    return slots;
  }

  checkAvailability(date: string, time: string, region: DiningRegion, partySize: number): boolean {
    const regionConfig = this.getDiningRegion(region);
    if (!regionConfig) return false;

    // Check if party size exceeds maximum for the region
    if (partySize > regionConfig.maxPartySize) return false;

    // Get all reservations for this date, time, and region
    const existingReservations = this.reservations.filter(
      r => r.date === date && r.time === time && r.region === region
    );

    // Calculate total seats reserved
    const totalSeatsReserved = existingReservations.reduce(
      (total, res) => total + res.partySize, 
      0
    );

    // Check if adding this party would exceed the region's capacity
    return (totalSeatsReserved + partySize) <= regionConfig.maxCapacity;
  }

  addReservation(reservation: Reservation): void {
    this.reservations.push(reservation);
  }

  getReservations(): Reservation[] {
    return [...this.reservations];
  }
} 