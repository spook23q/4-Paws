/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Sort sitters by distance from user
 * @param sitters - Array of sitters with location data
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @returns Sorted array of sitters with distance property
 */
export function sortSittersByDistance(
  sitters: any[],
  userLat: number,
  userLon: number
) {
  return sitters
    .map((sitter) => ({
      ...sitter,
      distance: calculateDistance(
        userLat,
        userLon,
        sitter.latitude || 0,
        sitter.longitude || 0
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}
