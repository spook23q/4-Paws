import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sitterProfiles, users, reviews } from "../../drizzle/schema";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";

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

      return {
        sitters: sitters.map((s) => ({
          ...s,
          pricePerDay: parseFloat(s.pricePerDay),
          pricePerNight: parseFloat(s.pricePerNight),
          averageRating: s.averageRating ? parseFloat(s.averageRating) : 0,
        })),
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
