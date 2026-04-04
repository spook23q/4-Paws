import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { favourites, users, sitterProfiles } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const favouritesRouter = router({
  // List all favourites for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const favs = await db
      .select({
        id: favourites.id,
        sitterId: favourites.sitterId,
        createdAt: favourites.createdAt,
        sitterName: users.name,
        sitterEmail: users.email,
        sitterPhoto: users.profilePhoto,
        sitterSuburb: sitterProfiles.suburb,
        sitterPricePerDay: sitterProfiles.pricePerDay,
        sitterPricePerNight: sitterProfiles.pricePerNight,
        sitterRating: sitterProfiles.averageRating,
        sitterTotalReviews: sitterProfiles.totalReviews,
        sitterYearsExperience: sitterProfiles.yearsExperience,
        sitterBio: sitterProfiles.bio,
      })
      .from(favourites)
      .innerJoin(users, eq(favourites.sitterId, users.id))
      .leftJoin(sitterProfiles, eq(favourites.sitterId, sitterProfiles.userId))
      .where(eq(favourites.userId, ctx.user.id));

    return favs.map((f) => ({
      ...f,
      sitterPricePerDay: f.sitterPricePerDay ? parseFloat(f.sitterPricePerDay) : null,
      sitterPricePerNight: f.sitterPricePerNight ? parseFloat(f.sitterPricePerNight) : null,
      sitterRating: f.sitterRating ? parseFloat(f.sitterRating) : 0,
    }));
  }),

  // Check if a sitter is favourited
  isFavourited: protectedProcedure
    .input(z.object({ sitterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterIdBig = BigInt(input.sitterId);
      const existing = await db
        .select({ id: favourites.id })
        .from(favourites)
        .where(
          and(
            eq(favourites.userId, ctx.user.id),
            eq(favourites.sitterId, sitterIdBig)
          )
        );

      return { isFavourited: existing.length > 0 };
    }),

  // Add a sitter to favourites
  add: protectedProcedure
    .input(z.object({ sitterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterIdBig = BigInt(input.sitterId);

      // Check if already favourited
      const existing = await db
        .select({ id: favourites.id })
        .from(favourites)
        .where(
          and(
            eq(favourites.userId, ctx.user.id),
            eq(favourites.sitterId, sitterIdBig)
          )
        );

      if (existing.length > 0) {
        return { success: true, message: "Already favourited" };
      }

      await db.insert(favourites).values({
        userId: ctx.user.id,
        sitterId: sitterIdBig,
      });

      return { success: true };
    }),

  // Remove a sitter from favourites
  remove: protectedProcedure
    .input(z.object({ sitterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterIdBig = BigInt(input.sitterId);

      await db
        .delete(favourites)
        .where(
          and(
            eq(favourites.userId, ctx.user.id),
            eq(favourites.sitterId, sitterIdBig)
          )
        );

      return { success: true };
    }),
});
