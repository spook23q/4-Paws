import { describe, it, expect } from "vitest";

// Haversine formula (copied from sittersRouter for unit testing)
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe("Haversine Distance Calculation", () => {
  it("should return 0 for same coordinates", () => {
    const dist = haversineDistance(-33.8688, 151.2093, -33.8688, 151.2093);
    expect(dist).toBe(0);
  });

  it("should calculate distance between Sydney CBD and Bondi Beach (~7km)", () => {
    // Sydney CBD: -33.8688, 151.2093
    // Bondi Beach: -33.8915, 151.2767
    const dist = haversineDistance(-33.8688, 151.2093, -33.8915, 151.2767);
    expect(dist).toBeGreaterThan(5);
    expect(dist).toBeLessThan(10);
  });

  it("should calculate distance between Sydney CBD and Parramatta (~23km)", () => {
    // Sydney CBD: -33.8688, 151.2093
    // Parramatta: -33.8151, 151.0011
    const dist = haversineDistance(-33.8688, 151.2093, -33.8151, 151.0011);
    expect(dist).toBeGreaterThan(18);
    expect(dist).toBeLessThan(28);
  });

  it("should calculate distance between Sydney CBD and Manly (~12km)", () => {
    // Sydney CBD: -33.8688, 151.2093
    // Manly: -33.7963, 151.2860
    const dist = haversineDistance(-33.8688, 151.2093, -33.7963, 151.2860);
    expect(dist).toBeGreaterThan(8);
    expect(dist).toBeLessThan(15);
  });

  it("should be symmetric (distance A->B equals B->A)", () => {
    const distAB = haversineDistance(-33.8688, 151.2093, -33.8915, 151.2767);
    const distBA = haversineDistance(-33.8915, 151.2767, -33.8688, 151.2093);
    expect(Math.abs(distAB - distBA)).toBeLessThan(0.001);
  });

  it("should handle large distances (Sydney to Melbourne ~714km)", () => {
    // Sydney: -33.8688, 151.2093
    // Melbourne: -37.8136, 144.9631
    const dist = haversineDistance(-33.8688, 151.2093, -37.8136, 144.9631);
    expect(dist).toBeGreaterThan(700);
    expect(dist).toBeLessThan(730);
  });
});

describe("Distance Filter Logic", () => {
  const mockSitters = [
    { id: 1, name: "Alice", lat: -33.8915, lon: 151.2767, distanceKm: 7.2 },   // Bondi ~7km
    { id: 2, name: "Bob", lat: -33.8151, lon: 151.0011, distanceKm: 22.5 },     // Parramatta ~23km
    { id: 3, name: "Carol", lat: -33.7963, lon: 151.2860, distanceKm: 11.3 },   // Manly ~12km
    { id: 4, name: "Dave", lat: -33.8700, lon: 151.2100, distanceKm: 0.2 },     // Very close
    { id: 5, name: "Eve", lat: undefined, lon: undefined, distanceKm: undefined }, // No location
  ];

  it("should filter sitters within 5km radius", () => {
    const filtered = mockSitters.filter(
      (s) => s.distanceKm !== undefined && s.distanceKm <= 5
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Dave");
  });

  it("should filter sitters within 10km radius", () => {
    const filtered = mockSitters.filter(
      (s) => s.distanceKm !== undefined && s.distanceKm <= 10
    );
    expect(filtered).toHaveLength(2);
    expect(filtered.map(s => s.name)).toContain("Alice");
    expect(filtered.map(s => s.name)).toContain("Dave");
  });

  it("should filter sitters within 20km radius", () => {
    const filtered = mockSitters.filter(
      (s) => s.distanceKm !== undefined && s.distanceKm <= 20
    );
    expect(filtered).toHaveLength(3);
  });

  it("should filter sitters within 50km radius (includes all with location)", () => {
    const filtered = mockSitters.filter(
      (s) => s.distanceKm !== undefined && s.distanceKm <= 50
    );
    expect(filtered).toHaveLength(4);
  });

  it("should exclude sitters without location data when filtering by distance", () => {
    const filtered = mockSitters.filter(
      (s) => s.distanceKm !== undefined && s.distanceKm <= 100
    );
    expect(filtered).toHaveLength(4);
    expect(filtered.find(s => s.name === "Eve")).toBeUndefined();
  });

  it("should sort sitters by distance (nearest first)", () => {
    const sorted = [...mockSitters]
      .filter(s => s.distanceKm !== undefined)
      .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    expect(sorted[0].name).toBe("Dave");
    expect(sorted[1].name).toBe("Alice");
    expect(sorted[2].name).toBe("Carol");
    expect(sorted[3].name).toBe("Bob");
  });
});

describe("Availability Date Range Logic", () => {
  it("should generate correct date range", () => {
    const startDate = "2026-03-20";
    const endDate = "2026-03-23";
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    expect(dates).toEqual(["2026-03-20", "2026-03-21", "2026-03-22", "2026-03-23"]);
  });

  it("should handle single day range", () => {
    const startDate = "2026-03-20";
    const endDate = "2026-03-20";
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    expect(dates).toEqual(["2026-03-20"]);
  });

  it("should handle month boundary", () => {
    const startDate = "2026-03-30";
    const endDate = "2026-04-02";
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    expect(dates).toEqual(["2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02"]);
  });

  it("should simulate availability matching (sitter available for all dates)", () => {
    const requestedDates = ["2026-03-20", "2026-03-21", "2026-03-22"];
    const sitterAvailableDates = [
      { date: "2026-03-20", status: "available" },
      { date: "2026-03-21", status: "available" },
      { date: "2026-03-22", status: "available" },
    ];
    const availableCount = sitterAvailableDates.filter(
      (a) => requestedDates.includes(a.date) && a.status === "available"
    ).length;
    expect(availableCount).toBe(requestedDates.length);
  });

  it("should simulate availability matching (sitter NOT available for all dates)", () => {
    const requestedDates = ["2026-03-20", "2026-03-21", "2026-03-22"];
    const sitterAvailableDates = [
      { date: "2026-03-20", status: "available" },
      { date: "2026-03-21", status: "unavailable" },
      { date: "2026-03-22", status: "available" },
    ];
    const availableCount = sitterAvailableDates.filter(
      (a) => requestedDates.includes(a.date) && a.status === "available"
    ).length;
    expect(availableCount).not.toBe(requestedDates.length);
  });

  it("should simulate availability matching (sitter has no availability records)", () => {
    const requestedDates = ["2026-03-20", "2026-03-21"];
    const sitterAvailableDates: { date: string; status: string }[] = [];
    const availableCount = sitterAvailableDates.filter(
      (a) => requestedDates.includes(a.date) && a.status === "available"
    ).length;
    expect(availableCount).toBe(0);
    expect(availableCount).not.toBe(requestedDates.length);
  });
});

describe("Filter Count Logic", () => {
  it("should count active filters correctly", () => {
    const countFilters = (filters: {
      minPrice?: string;
      maxPrice?: string;
      minRating?: number;
      maxDistanceKm?: number;
      availableFrom?: string;
      availableTo?: string;
      skills: string[];
    }) => {
      let count = 0;
      if (filters.minPrice) count++;
      if (filters.maxPrice) count++;
      if (filters.minRating) count++;
      if (filters.maxDistanceKm) count++;
      if (filters.availableFrom) count++;
      if (filters.availableTo) count++;
      count += filters.skills.length;
      return count;
    };

    expect(countFilters({ skills: [] })).toBe(0);
    expect(countFilters({ maxDistanceKm: 10, skills: [] })).toBe(1);
    expect(countFilters({ availableFrom: "2026-03-20", availableTo: "2026-03-25", skills: [] })).toBe(2);
    expect(countFilters({ maxDistanceKm: 5, availableFrom: "2026-03-20", skills: ["Medication", "Kittens"] })).toBe(4);
    expect(countFilters({ minPrice: "30", maxPrice: "80", minRating: 4, maxDistanceKm: 20, availableFrom: "2026-03-20", availableTo: "2026-03-25", skills: ["Medication"] })).toBe(7);
  });
});
