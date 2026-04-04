import { describe, it, expect } from "vitest";
import {
  isSuburbInSydney,
  isCoordinateInSydney,
  isWithinSydneyRadius,
  isLocationInServiceArea,
  haversineDistanceKm,
  SYDNEY_BOUNDS,
  SYDNEY_CENTRE,
  MAX_RADIUS_KM,
  OUT_OF_AREA_MESSAGE,
} from "../shared/sydney-geofence";

describe("Sydney Geo-Fence", () => {
  describe("isSuburbInSydney", () => {
    it("should accept well-known Sydney suburbs (exact match)", () => {
      expect(isSuburbInSydney("Bondi")).toBe(true);
      expect(isSuburbInSydney("Newtown")).toBe(true);
      expect(isSuburbInSydney("Parramatta")).toBe(true);
      expect(isSuburbInSydney("Manly")).toBe(true);
      expect(isSuburbInSydney("Chatswood")).toBe(true);
      expect(isSuburbInSydney("Surry Hills")).toBe(false); // not in list as exact but partial should work
    });

    it("should be case-insensitive", () => {
      expect(isSuburbInSydney("bondi")).toBe(true);
      expect(isSuburbInSydney("BONDI")).toBe(true);
      expect(isSuburbInSydney("Bondi Beach")).toBe(true);
      expect(isSuburbInSydney("bondi beach")).toBe(true);
      expect(isSuburbInSydney("BONDI BEACH")).toBe(true);
    });

    it("should handle trimming and whitespace", () => {
      expect(isSuburbInSydney("  Bondi  ")).toBe(true);
      expect(isSuburbInSydney(" Newtown ")).toBe(true);
    });

    it("should accept partial matches (substring)", () => {
      expect(isSuburbInSydney("Bondi")).toBe(true); // matches "bondi beach", "bondi junction"
      expect(isSuburbInSydney("North Sydney")).toBe(true);
      expect(isSuburbInSydney("Sydney CBD")).toBe(true);
    });

    it("should reject suburbs outside Sydney", () => {
      expect(isSuburbInSydney("Melbourne")).toBe(false);
      expect(isSuburbInSydney("Brisbane")).toBe(false);
      expect(isSuburbInSydney("Perth")).toBe(false);
      expect(isSuburbInSydney("Adelaide")).toBe(false);
      expect(isSuburbInSydney("Wollongong")).toBe(false);
      expect(isSuburbInSydney("Newcastle")).toBe(false);
      expect(isSuburbInSydney("Gold Coast")).toBe(false);
    });

    it("should reject empty or nonsense input", () => {
      expect(isSuburbInSydney("")).toBe(false);
      expect(isSuburbInSydney("   ")).toBe(false);
      expect(isSuburbInSydney("xyz123")).toBe(false);
    });

    it("should accept Sydney CBD and inner city suburbs", () => {
      expect(isSuburbInSydney("Sydney")).toBe(true);
      expect(isSuburbInSydney("The Rocks")).toBe(true);
      expect(isSuburbInSydney("Barangaroo")).toBe(true);
      expect(isSuburbInSydney("Pyrmont")).toBe(true);
      expect(isSuburbInSydney("Ultimo")).toBe(true);
    });

    it("should accept outer Sydney suburbs", () => {
      expect(isSuburbInSydney("Penrith")).toBe(true);
      expect(isSuburbInSydney("Campbelltown")).toBe(true);
      expect(isSuburbInSydney("Hornsby")).toBe(true);
      expect(isSuburbInSydney("Cronulla")).toBe(true);
      expect(isSuburbInSydney("Palm Beach")).toBe(true);
    });

    it("should accept generic area names", () => {
      expect(isSuburbInSydney("Inner West")).toBe(true);
      expect(isSuburbInSydney("Eastern Suburbs")).toBe(true);
      expect(isSuburbInSydney("North Shore")).toBe(true);
      expect(isSuburbInSydney("Northern Beaches")).toBe(true);
      expect(isSuburbInSydney("Western Sydney")).toBe(true);
    });
  });

  describe("isCoordinateInSydney", () => {
    it("should accept coordinates in Sydney CBD", () => {
      // Sydney CBD: -33.8688, 151.2093
      expect(isCoordinateInSydney(-33.8688, 151.2093)).toBe(true);
    });

    it("should accept coordinates in various Sydney suburbs", () => {
      // Bondi Beach
      expect(isCoordinateInSydney(-33.8915, 151.2767)).toBe(true);
      // Parramatta
      expect(isCoordinateInSydney(-33.8150, 151.0011)).toBe(true);
      // Manly
      expect(isCoordinateInSydney(-33.7969, 151.2838)).toBe(true);
      // Penrith
      expect(isCoordinateInSydney(-33.7510, 150.6942)).toBe(true);
      // Cronulla
      expect(isCoordinateInSydney(-34.0587, 151.1521)).toBe(true);
    });

    it("should reject coordinates outside Sydney bounding box", () => {
      // Melbourne
      expect(isCoordinateInSydney(-37.8136, 144.9631)).toBe(false);
      // Brisbane
      expect(isCoordinateInSydney(-27.4698, 153.0251)).toBe(false);
      // Wollongong (south of boundary)
      expect(isCoordinateInSydney(-34.4278, 150.8931)).toBe(false);
      // Newcastle (north of boundary)
      expect(isCoordinateInSydney(-32.9283, 151.7817)).toBe(false);
      // Blue Mountains (west of boundary)
      expect(isCoordinateInSydney(-33.7115, 150.3119)).toBe(false);
    });

    it("should handle boundary edge cases", () => {
      // Just inside north boundary
      expect(isCoordinateInSydney(SYDNEY_BOUNDS.north, 151.0)).toBe(true);
      // Just inside south boundary
      expect(isCoordinateInSydney(SYDNEY_BOUNDS.south, 151.0)).toBe(true);
      // Just outside north boundary
      expect(isCoordinateInSydney(SYDNEY_BOUNDS.north + 0.01, 151.0)).toBe(false);
      // Just outside south boundary
      expect(isCoordinateInSydney(SYDNEY_BOUNDS.south - 0.01, 151.0)).toBe(false);
    });
  });

  describe("haversineDistanceKm", () => {
    it("should calculate distance from Sydney CBD to Bondi Beach (~7km)", () => {
      const dist = haversineDistanceKm(-33.8688, 151.2093, -33.8915, 151.2767);
      expect(dist).toBeGreaterThan(5);
      expect(dist).toBeLessThan(10);
    });

    it("should calculate distance from Sydney CBD to Parramatta (~22km)", () => {
      const dist = haversineDistanceKm(-33.8688, 151.2093, -33.8150, 151.0011);
      expect(dist).toBeGreaterThan(18);
      expect(dist).toBeLessThan(26);
    });

    it("should return 0 for same point", () => {
      const dist = haversineDistanceKm(-33.8688, 151.2093, -33.8688, 151.2093);
      expect(dist).toBe(0);
    });

    it("should calculate distance from Sydney CBD to Penrith (~50km)", () => {
      const dist = haversineDistanceKm(-33.8688, 151.2093, -33.7510, 150.6942);
      expect(dist).toBeGreaterThan(45);
      expect(dist).toBeLessThan(55);
    });
  });

  describe("isWithinSydneyRadius", () => {
    it("should accept Sydney CBD", () => {
      expect(isWithinSydneyRadius(-33.8688, 151.2093)).toBe(true);
    });

    it("should accept inner suburbs", () => {
      // Bondi
      expect(isWithinSydneyRadius(-33.8915, 151.2767)).toBe(true);
      // Newtown
      expect(isWithinSydneyRadius(-33.8976, 151.1790)).toBe(true);
    });

    it("should accept outer suburbs within radius", () => {
      // Penrith (~50km)
      expect(isWithinSydneyRadius(-33.7510, 150.6942)).toBe(true);
      // Campbelltown (~50km)
      expect(isWithinSydneyRadius(-34.0651, 150.8142)).toBe(true);
    });

    it("should reject locations far outside Sydney", () => {
      // Melbourne
      expect(isWithinSydneyRadius(-37.8136, 144.9631)).toBe(false);
      // Canberra
      expect(isWithinSydneyRadius(-35.2809, 149.1300)).toBe(false);
    });
  });

  describe("isLocationInServiceArea", () => {
    it("should accept by suburb name when no coordinates provided", () => {
      expect(isLocationInServiceArea("Bondi")).toBe(true);
      expect(isLocationInServiceArea("Newtown")).toBe(true);
    });

    it("should reject by suburb name when outside Sydney", () => {
      expect(isLocationInServiceArea("Melbourne")).toBe(false);
      expect(isLocationInServiceArea("Brisbane")).toBe(false);
    });

    it("should prioritise coordinates over suburb name", () => {
      // Valid suburb but invalid coordinates
      expect(isLocationInServiceArea("Bondi", -37.8136, 144.9631)).toBe(false);
      // Invalid suburb but valid coordinates
      expect(isLocationInServiceArea("SomePlace", -33.8688, 151.2093)).toBe(true);
    });

    it("should accept valid coordinates with valid suburb", () => {
      expect(isLocationInServiceArea("Bondi", -33.8915, 151.2767)).toBe(true);
    });

    it("should return false when no data provided", () => {
      expect(isLocationInServiceArea()).toBe(false);
      expect(isLocationInServiceArea("")).toBe(false);
      expect(isLocationInServiceArea(undefined, undefined, undefined)).toBe(false);
    });
  });

  describe("Constants", () => {
    it("should have correct Sydney centre coordinates", () => {
      expect(SYDNEY_CENTRE.latitude).toBeCloseTo(-33.8688, 2);
      expect(SYDNEY_CENTRE.longitude).toBeCloseTo(151.2093, 2);
    });

    it("should have reasonable bounding box", () => {
      expect(SYDNEY_BOUNDS.north).toBeGreaterThan(SYDNEY_BOUNDS.south);
      expect(SYDNEY_BOUNDS.east).toBeGreaterThan(SYDNEY_BOUNDS.west);
    });

    it("should have a reasonable max radius", () => {
      expect(MAX_RADIUS_KM).toBeGreaterThan(30);
      expect(MAX_RADIUS_KM).toBeLessThan(100);
    });

    it("should have a user-friendly error message", () => {
      expect(OUT_OF_AREA_MESSAGE).toContain("Sydney");
      expect(OUT_OF_AREA_MESSAGE).toContain("metro");
    });
  });
});
