export type UserRole = 'customer' | 'provider' | 'admin';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  unit?: string; // e.g. "per visit", "per hour", "per unit"
}

export interface ProviderProfile {
  _id: string;
  userId: string | User;
  username?: string;
  businessName: string;
  tagline: string;
  category: string; // e.g. "Electrician", "AC Mechanic", "Cleaning", "Plumber"
  rating: number;
  reviewCount: number;
  experienceYears: number;
  address: string;
  city: string;
  area: string;
  location: Coordinates; // latitude and longitude for Leaflet map & distance calculation
  distanceKm?: number; // dynamic computed distance from user location
  phone: string;
  whatsapp?: string;
  email?: string;
  about: string;
  avatarUrl: string;
  coverUrl?: string;
  isVerified: boolean;
  isAvailable: boolean; // toggle for "Available Today" vs "Busy"
  pricingStartsAt: number;
  services: ServiceItem[];
  badges: string[]; // e.g. ["Police Verified", "Same Day Service", "Top Rated"]
  workingType?: string; // e.g. "On-site / Home Visit", "In-Shop / Workshop", "Both (Home Visit & Shop)", "24/7 Emergency Service"
  workingHours?: string;
  totalCallsReceived?: number;
}

export interface Review {
  _id: string;
  providerId: string;
  userId: string | User;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}
