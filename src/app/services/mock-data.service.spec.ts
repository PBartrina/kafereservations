import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';
import { DiningRegion, Reservation } from '../types/reservation.types';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDiningRegions', () => {
    it('should return all dining regions', () => {
      const regions = service.getDiningRegions();
      expect(regions.length).toBe(4);
      expect(regions.map(r => r.id)).toContain('main-hall');
      expect(regions.map(r => r.id)).toContain('bar');
      expect(regions.map(r => r.id)).toContain('riverside');
      expect(regions.map(r => r.id)).toContain('riverside-smoking');
    });

    it('should return correct capacities for each region', () => {
      const regions = service.getDiningRegions();
      const mainHall = regions.find(r => r.id === 'main-hall');
      const bar = regions.find(r => r.id === 'bar');
      const riverside = regions.find(r => r.id === 'riverside');
      const riversideSmoking = regions.find(r => r.id === 'riverside-smoking');

      expect(mainHall?.maxCapacity).toBe(48);
      expect(bar?.maxCapacity).toBe(12);
      expect(riverside?.maxCapacity).toBe(24);
      expect(riversideSmoking?.maxCapacity).toBe(12);
    });
  });

  describe('getTimeSlots', () => {
    it('should return correct number of time slots', () => {
      const slots = service.getTimeSlots();
      // 6:00, 6:30, 7:00, 7:30, 8:00, 8:30, 9:00, 9:30, 10:00
      expect(slots.length).toBe(9);
    });

    it('should return slots in correct format', () => {
      const slots = service.getTimeSlots();
      expect(slots[0].time).toBe('18:00');
      expect(slots[1].time).toBe('18:30');
      expect(slots[slots.length - 1].time).toBe('22:00');
    });
  });

  describe('checkAvailability', () => {
    const testDate = '2024-07-24';
    const testTime = '18:00';

    it('should return true for valid reservation within capacity', () => {
      const available = service.checkAvailability(testDate, testTime, 'main-hall', 10);
      expect(available).toBe(true);
    });

    it('should return false when party size exceeds region maximum', () => {
      const available = service.checkAvailability(testDate, testTime, 'bar', 5);
      expect(available).toBe(false);
    });

    it('should return false when region would be over capacity', () => {
      // Add reservations to fill up the bar (capacity 12)
      const reservation1: Reservation = {
        id: '1',
        date: testDate,
        time: testTime,
        name: 'Test 1',
        email: 'test1@test.com',
        phone: '1234567890',
        partySize: 4,
        region: 'bar',
        childrenCount: 0,
        smoking: false,
        birthday: false
      };

      const reservation2: Reservation = {
        id: '2',
        date: testDate,
        time: testTime,
        name: 'Test 2',
        email: 'test2@test.com',
        phone: '1234567890',
        partySize: 4,
        region: 'bar',
        childrenCount: 0,
        smoking: false,
        birthday: false
      };

      const reservation3: Reservation = {
        id: '3',
        date: testDate,
        time: testTime,
        name: 'Test 3',
        email: 'test3@test.com',
        phone: '1234567890',
        partySize: 4,
        region: 'bar',
        childrenCount: 0,
        smoking: false,
        birthday: false
      };

      service.addReservation(reservation1);
      service.addReservation(reservation2);
      service.addReservation(reservation3);

      // Try to add another reservation
      const available = service.checkAvailability(testDate, testTime, 'bar', 2);
      expect(available).toBe(false);
    });

    it('should handle reservations for different times independently', () => {
      // Fill up bar at 18:00
      const reservation: Reservation = {
        id: '1',
        date: testDate,
        time: '18:00',
        name: 'Test',
        email: 'test@test.com',
        phone: '1234567890',
        partySize: 12, // Fill to capacity
        region: 'bar',
        childrenCount: 0,
        smoking: false,
        birthday: false
      };

      service.addReservation(reservation);

      // Check availability for same date but different time
      const available = service.checkAvailability(testDate, '18:30', 'bar', 4);
      expect(available).toBe(true);
    });
  });

  describe('getReservations', () => {
    it('should return empty array initially', () => {
      const reservations = service.getReservations();
      expect(reservations).toEqual([]);
    });

    it('should return added reservations', () => {
      const reservation: Reservation = {
        id: '1',
        date: '2024-07-24',
        time: '18:00',
        name: 'Test',
        email: 'test@test.com',
        phone: '1234567890',
        partySize: 4,
        region: 'main-hall',
        childrenCount: 0,
        smoking: false,
        birthday: false
      };

      service.addReservation(reservation);
      const reservations = service.getReservations();
      expect(reservations.length).toBe(1);
      expect(reservations[0]).toEqual(reservation);
    });
  });
}); 