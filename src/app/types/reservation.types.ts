export type DiningRegion = 'main-hall' | 'bar' | 'riverside' | 'riverside-smoking';

export interface ReservationDetails {
  date: Date;
  time: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  region: DiningRegion;
  childrenCount: number;
  smoking: boolean;
  birthday: boolean;
  birthdayName?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface RegionAvailability {
  region: DiningRegion;
  maxCapacity: number;
  availableSlots: number;
  allowsChildren: boolean;
  allowsSmoking: boolean;
}
