import { describe, it, expect } from "vitest";

describe("Google Places API", () => {
  it("should have valid Google Places API key", async () => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");

    // Test the API key with a simple geocoding request
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Sydney,Australia&key=${apiKey}`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Check if the API key is valid (not an error response)
    expect(data.status).not.toBe("REQUEST_DENIED");
    expect(data.status).toBe("OK");
    expect(data.results).toBeDefined();
    expect(data.results.length).toBeGreaterThan(0);
  }, 10000); // 10 second timeout for API call
});
