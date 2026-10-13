import { Coordinates } from '../types';

export const CITY_COORDINATES: Record<string, Coordinates> = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
};

export const DISTRICTS = ['Bangalore', 'Chennai', 'Mumbai', 'Hyderabad', 'Delhi'];

/**
 * Calculates straight-line distance in kilometers between two lat/lng coordinates
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Finds the nearest matching city / district from given coordinates
 */
export function findNearestDistrict(coords: Coordinates): string {
  let nearestCity = 'Bangalore';
  let minDistance = Infinity;

  Object.entries(CITY_COORDINATES).forEach(([city, cityCoords]) => {
    const dist = calculateDistanceKm(coords, cityCoords);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  });

  return nearestCity;
}

/**
 * Generates dynamic avatar URL with stylized traits
 */
export function generateAvatarUrl(name: string, category?: string): string {
  const cleanSeed = encodeURIComponent(name.replace(/[^a-zA-Z0-9]/g, ''));
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}
