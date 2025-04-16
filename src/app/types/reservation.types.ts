export type DiningRegion = 'main-hall' | 'bar' | 'riverside' | 'riverside-smoking';

export interface DiningRegionConfig {
  id: DiningRegion;
  name: string;
  maxPartySize: number;
  maxCapacity: number;
  allowsChildren: boolean;
  allowsSmoking: boolean;
}

export interface Reservation {
  id: string;
  date: string;
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
  available: boolean;
}

export interface AvailabilityRequest {
  date: string;
  time: string;
  region: DiningRegion;
  partySize: number;
}
