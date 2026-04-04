import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sitterProfiles, users, reviews, sitterAvailability } from "../../drizzle/schema";
import { eq, and, gte, lte, like, sql, inArray } from "drizzle-orm";

// Haversine formula to calculate distance between two lat/lng points in km
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

export const sittersRouter = router({
  // Search sitters with filters
  search: publicProcedure
    .input(
      z.object({
        suburb: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minRating: z.number().min(0).max(5).optional(),
        acceptsIndoor: z.boolean().optional(),
        acceptsOutdoor: z.boolean().optional(),
        acceptsKittens: z.boolean().optional(),
        acceptsSeniors: z.boolean().optional(),
        acceptsMedicalNeeds: z.boolean().optional(),
        canAdministerMedication: z.boolean().optional(),
        canGiveInjections: z.boolean().optional(),
        experienceSpecialDiets: z.boolean().optional(),
        // Location-based filtering
        userLatitude: z.number().optional(),
        userLongitude: z.number().optional(),
        maxDistanceKm: z.number().min(1).max(100).optional(),
        // Availability date filtering
        availableFrom: z.string().optional(), // YYYY-MM-DD
        availableTo: z.string().optional(),   // YYYY-MM-DD
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Build where conditions
      const conditions: any[] = [];

      if (input.suburb) {
        conditions.push(like(sitterProfiles.suburb, `%${input.suburb}%`));
      }

      if (input.minPrice !== undefined) {
        conditions.push(gte(sitterProfiles.pricePerDay, input.minPrice.toString()));
      }

      if (input.maxPrice !== undefined) {
        conditions.push(lte(sitterProfiles.pricePerDay, input.maxPrice.toString()));
      }

      if (input.minRating !== undefined) {
        conditions.push(gte(sitterProfiles.averageRating, input.minRating.toString()));
      }

      if (input.acceptsIndoor !== undefined) {
        conditions.push(eq(sitterProfiles.acceptsIndoor, input.acceptsIndoor));
      }

      if (input.acceptsOutdoor !== undefined) {
        conditions.push(eq(sitterProfiles.acceptsOutdoor, input.acceptsOutdoor));
      }

      if (input.acceptsKittens !== undefined) {
        conditions.push(eq(sitterProfiles.acceptsKittens, input.acceptsKittens));
      }

      if (input.acceptsSeniors !== undefined) {
        conditions.push(eq(sitterProfiles.acceptsSeniors, input.acceptsSeniors));
      }

      if (input.acceptsMedicalNeeds !== undefined) {
        conditions.push(eq(sitterProfiles.acceptsMedicalNeeds, input.acceptsMedicalNeeds));
      }

      if (input.canAdministerMedication !== undefined) {
        conditions.push(eq(sitterProfiles.canAdministerMedication, input.canAdministerMedication));
      }

      if (input.canGiveInjections !== undefined) {
        conditions.push(eq(sitterProfiles.canGiveInjections, input.canGiveInjections));
      }

      if (input.experienceSpecialDiets !== undefined) {
        conditions.push(eq(sitterProfiles.experienceSpecialDiets, input.experienceSpecialDiets));
      }

      // If availability dates are provided, find sitters who are available
      let availableSitterIds: bigint[] | undefined;
      if (input.availableFrom || input.availableTo) {
        const startDate = input.availableFrom || input.availableTo!;
        const endDate = input.availableTo || input.availableFrom!;
        
        // Generate all dates in the range
        const dates: string[] = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
        
        if (dates.length > 0) {
          // Find sitters who have "available" status for ALL dates in the range
          const availabilityRecords = await db
            .select({
              sitterId: sitterAvailability.sitterId,
              dateCount: sql<number>`COUNT(DISTINCT ${sitterAvailability.date})`.as('date_count'),
            })
            .from(sitterAvailability)
            .where(
              and(
                inArray(sitterAvailability.date, dates),
                eq(sitterAvailability.status, "available")
              )
            )
            .groupBy(sitterAvailability.sitterId)
            .having(sql`COUNT(DISTINCT ${sitterAvailability.date}) = ${dates.length}`);
          
          availableSitterIds = availabilityRecords.map(r => r.sitterId);
          
          // If no sitters are available for all dates, return empty
          if (availableSitterIds.length === 0) {
            return { sitters: [], hasMore: false };
          }
          
          conditions.push(inArray(sitterProfiles.userId, availableSitterIds));
        }
      }

      // Query sitters with user info
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const sitters = await db
        .select({
          id: sitterProfiles.id,
          userId: sitterProfiles.userId,
          suburb: sitterProfiles.suburb,
          latitude: sitterProfiles.latitude,
          longitude: sitterProfiles.longitude,
          serviceAreaRadius: sitterProfiles.serviceAreaRadius,
          pricePerDay: sitterProfiles.pricePerDay,
          pricePerNight: sitterProfiles.pricePerNight,
          yearsExperience: sitterProfiles.yearsExperience,
          bio: sitterProfiles.bio,
          acceptsIndoor: sitterProfiles.acceptsIndoor,
          acceptsOutdoor: sitterProfiles.acceptsOutdoor,
          acceptsKittens: sitterProfiles.acceptsKittens,
          acceptsSeniors: sitterProfiles.acceptsSeniors,
          acceptsMedicalNeeds: sitterProfiles.acceptsMedicalNeeds,
          canAdministerMedication: sitterProfiles.canAdministerMedication,
          canGiveInjections: sitterProfiles.canGiveInjections,
          experienceSpecialDiets: sitterProfiles.experienceSpecialDiets,
          canHandleMultipleCats: sitterProfiles.canHandleMultipleCats,
          averageRating: sitterProfiles.averageRating,
          totalReviews: sitterProfiles.totalReviews,
          totalBookings: sitterProfiles.totalBookings,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userProfilePhoto: users.profilePhoto,
        })
        .from(sitterProfiles)
        .innerJoin(users, eq(sitterProfiles.userId, users.id))
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset);

      // Map and optionally filter by distance
      let mappedSitters = sitters.map((s) => ({
        ...s,
        pricePerDay: parseFloat(s.pricePerDay),
        pricePerNight: parseFloat(s.pricePerNight),
        averageRating: s.averageRating ? parseFloat(s.averageRating) : 0,
        distanceKm: (input.userLatitude && input.userLongitude && s.latitude && s.longitude)
          ? haversineDistance(
              input.userLatitude, input.userLongitude,
              parseFloat(String(s.latitude)), parseFloat(String(s.longitude))
            )
          : undefined,
      }));

      // Filter by max distance if specified
      if (input.maxDistanceKm && input.userLatitude && input.userLongitude) {
        mappedSitters = mappedSitters.filter(
          (s) => s.distanceKm !== undefined && s.distanceKm <= input.maxDistanceKm!
        );
      }

      // Sort by distance if user location is provided
      if (input.userLatitude && input.userLongitude) {
        mappedSitters.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
      }

      return {
        sitters: mappedSitters,
        hasMore: sitters.length === input.limit,
      };
    }),

  // Get sitter by ID with reviews
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = BigInt(input.userId);

      // Get sitter profile with user info
      const sitter = await db
        .select({
          id: sitterProfiles.id,
          userId: sitterProfiles.userId,
          suburb: sitterProfiles.suburb,
          latitude: sitterProfiles.latitude,
          longitude: sitterProfiles.longitude,
          serviceAreaRadius: sitterProfiles.serviceAreaRadius,
          pricePerDay: sitterProfiles.pricePerDay,
          pricePerNight: sitterProfiles.pricePerNight,
          yearsExperience: sitterProfiles.yearsExperience,
          bio: sitterProfiles.bio,
          acceptsIndoor: sitterProfiles.acceptsIndoor,
          acceptsOutdoor: sitterProfiles.acceptsOutdoor,
          acceptsKittens: sitterProfiles.acceptsKittens,
          acceptsSeniors: sitterProfiles.acceptsSeniors,
          acceptsMedicalNeeds: sitterProfiles.acceptsMedicalNeeds,
          canAdministerMedication: sitterProfiles.canAdministerMedication,
          canGiveInjections: sitterProfiles.canGiveInjections,
          experienceSpecialDiets: sitterProfiles.experienceSpecialDiets,
          canHandleMultipleCats: sitterProfiles.canHandleMultipleCats,
          averageRating: sitterProfiles.averageRating,
          totalReviews: sitterProfiles.totalReviews,
          totalBookings: sitterProfiles.totalBookings,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userProfilePhoto: users.profilePhoto,
        })
        .from(sitterProfiles)
        .innerJoin(users, eq(sitterProfiles.userId, users.id))
        .where(eq(sitterProfiles.userId, userId))
        ;

      if (!sitter[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sitter not found",
        });
      }

      // Get reviews for this sitter
      const sitterReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          reviewText: reviews.reviewText,
          createdAt: reviews.createdAt,
          ownerName: users.name,
          ownerPhoto: users.profilePhoto,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.ownerId, users.id))
        .where(eq(reviews.sitterId, userId))
        .orderBy(sql`${reviews.createdAt} DESC`)
        .limit(20);

      return {
        ...sitter[0],
        pricePerDay: parseFloat(sitter[0].pricePerDay),
        pricePerNight: parseFloat(sitter[0].pricePerNight),
        averageRating: sitter[0].averageRating ? parseFloat(sitter[0].averageRating) : 0,
        reviews: sitterReviews,
      };
    }),
});
