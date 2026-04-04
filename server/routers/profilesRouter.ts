import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ownerProfiles, sitterProfiles, cats, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { isLocationInServiceArea, OUT_OF_AREA_MESSAGE } from "../../shared/sydney-geofence";

export const profilesRouter = router({
  // Create or update owner profile
  createOwnerProfile: protectedProcedure
    .input(
      z.object({
        suburb: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only cat owners can create owner profiles",
        });
      }

      // Geo-fence: validate suburb is within Sydney metro area
      if (!isLocationInServiceArea(input.suburb, input.latitude, input.longitude)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: OUT_OF_AREA_MESSAGE,
        });
      }

      // Check if profile exists
      const existing = await db
        .select()
        .from(ownerProfiles)
        .where(eq(ownerProfiles.userId, ctx.user.id))
        ;

      if (existing.length > 0) {
        // Update existing profile
        await db
          .update(ownerProfiles)
          .set({
            suburb: input.suburb,
            latitude: input.latitude?.toString(),
            longitude: input.longitude?.toString(),
          })
          .where(eq(ownerProfiles.userId, ctx.user.id));
      } else {
        // Create new profile
        await db.insert(ownerProfiles).values({
          userId: ctx.user.id,
          suburb: input.suburb,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        });
      }

      return { success: true };
    }),

  // Create or update sitter profile
  createSitterProfile: protectedProcedure
    .input(
      z.object({
        suburb: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        serviceAreaRadius: z.number().min(1).max(100),
        pricePerDay: z.number().min(0),
        pricePerNight: z.number().min(0),
        yearsExperience: z.number().min(0),
        bio: z.string().max(500).optional(),
        acceptsIndoor: z.boolean(),
        acceptsOutdoor: z.boolean(),
        acceptsKittens: z.boolean(),
        acceptsSeniors: z.boolean(),
        acceptsMedicalNeeds: z.boolean(),
        canAdministerMedication: z.boolean(),
        canGiveInjections: z.boolean(),
        experienceSpecialDiets: z.boolean(),
        canHandleMultipleCats: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only cat sitters can create sitter profiles",
        });
      }

      // Geo-fence: validate suburb is within Sydney metro area
      if (!isLocationInServiceArea(input.suburb, input.latitude, input.longitude)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: OUT_OF_AREA_MESSAGE,
        });
      }

      // Check if profile exists
      const existing = await db
        .select()
        .from(sitterProfiles)
        .where(eq(sitterProfiles.userId, ctx.user.id))
        ;

      if (existing.length > 0) {
        // Update existing profile
        await db
          .update(sitterProfiles)
          .set({
            suburb: input.suburb,
            latitude: input.latitude?.toString(),
            longitude: input.longitude?.toString(),
            serviceAreaRadius: input.serviceAreaRadius,
            pricePerDay: input.pricePerDay.toString(),
            pricePerNight: input.pricePerNight.toString(),
            yearsExperience: input.yearsExperience,
            bio: input.bio,
            acceptsIndoor: input.acceptsIndoor,
            acceptsOutdoor: input.acceptsOutdoor,
            acceptsKittens: input.acceptsKittens,
            acceptsSeniors: input.acceptsSeniors,
            acceptsMedicalNeeds: input.acceptsMedicalNeeds,
            canAdministerMedication: input.canAdministerMedication,
            canGiveInjections: input.canGiveInjections,
            experienceSpecialDiets: input.experienceSpecialDiets,
            canHandleMultipleCats: input.canHandleMultipleCats,
          })
          .where(eq(sitterProfiles.userId, ctx.user.id));
      } else {
        // Create new profile
        await db.insert(sitterProfiles).values({
          userId: ctx.user.id,
          suburb: input.suburb,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          serviceAreaRadius: input.serviceAreaRadius,
          pricePerDay: input.pricePerDay.toString(),
          pricePerNight: input.pricePerNight.toString(),
          yearsExperience: input.yearsExperience,
          bio: input.bio,
          acceptsIndoor: input.acceptsIndoor,
          acceptsOutdoor: input.acceptsOutdoor,
          acceptsKittens: input.acceptsKittens,
          acceptsSeniors: input.acceptsSeniors,
          acceptsMedicalNeeds: input.acceptsMedicalNeeds,
          canAdministerMedication: input.canAdministerMedication,
          canGiveInjections: input.canGiveInjections,
          experienceSpecialDiets: input.experienceSpecialDiets,
          canHandleMultipleCats: input.canHandleMultipleCats,
        });
      }

      return { success: true };
    }),

  // Get owner profile
  getOwnerProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const profile = await db
      .select()
      .from(ownerProfiles)
      .where(eq(ownerProfiles.userId, ctx.user.id))
      ;

    return profile[0] || null;
  }),

  // Get sitter profile
  getSitterProfile: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = input.userId ? BigInt(input.userId) : ctx.user.id;

      const profile = await db
        .select()
        .from(sitterProfiles)
        .where(eq(sitterProfiles.userId, userId))
        ;

      return profile[0] || null;
    }),

  // Add cat for owner
  addCat: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        age: z.number().min(0),
        photo: z.string().optional(),
        temperament: z.array(z.string()),
        medicalNotes: z.string().optional(),
        feedingSchedule: z.string().optional(),
        isIndoor: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only cat owners can add cats",
        });
      }

      const result = await db.insert(cats).values({
        ownerId: ctx.user.id,
        name: input.name,
        age: input.age,
        photo: input.photo,
        temperament: JSON.stringify(input.temperament),
        medicalNotes: input.medicalNotes,
        feedingSchedule: input.feedingSchedule,
        isIndoor: input.isIndoor,
      });

      return {
        success: true,
        catId: result[0].insertId,
      };
    }),

  // Get cats for owner
  getCats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const catsList = await db
      .select()
      .from(cats)
      .where(eq(cats.ownerId, ctx.user.id));

    return catsList.map((cat) => ({
      ...cat,
      temperament: JSON.parse(cat.temperament || "[]"),
    }));
  }),

  // Update cat
  updateCat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().min(0),
        photo: z.string().optional(),
        temperament: z.array(z.string()),
        medicalNotes: z.string().optional(),
        feedingSchedule: z.string().optional(),
        isIndoor: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const catId = BigInt(input.id);

      // Verify ownership
      const cat = await db
        .select()
        .from(cats)
        .where(eq(cats.id, catId))
        ;

      if (!cat[0] || cat[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own cats",
        });
      }

      await db
        .update(cats)
        .set({
          name: input.name,
          age: input.age,
          photo: input.photo,
          temperament: JSON.stringify(input.temperament),
          medicalNotes: input.medicalNotes,
          feedingSchedule: input.feedingSchedule,
          isIndoor: input.isIndoor,
        })
        .where(eq(cats.id, catId));

      return { success: true };
    }),

  // Delete cat
  deleteCat: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const catId = BigInt(input.id);

      // Verify ownership
      const cat = await db
        .select()
        .from(cats)
        .where(eq(cats.id, catId))
        ;

      if (!cat[0] || cat[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own cats",
        });
      }

      await db.delete(cats).where(eq(cats.id, catId));

      return { success: true };
    }),

  // Update user address
  updateAddress: protectedProcedure
    .input(
      z.object({
        streetAddress: z.string().optional(),
        suburb: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        country: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Geo-fence: validate address is within Sydney metro area
      if (input.suburb && !isLocationInServiceArea(input.suburb, input.latitude, input.longitude)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: OUT_OF_AREA_MESSAGE,
        });
      }

      await db
        .update(users)
        .set({
          streetAddress: input.streetAddress,
          suburb: input.suburb,
          state: input.state,
          postcode: input.postcode,
          country: input.country,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // Get user address
  getAddress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const user = await db
      .select({
        streetAddress: users.streetAddress,
        suburb: users.suburb,
        state: users.state,
        postcode: users.postcode,
        country: users.country,
        latitude: users.latitude,
        longitude: users.longitude,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    return user[0] || null;
  }),
});
