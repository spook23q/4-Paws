import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sitterAvailability } from "../../drizzle/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";

export const availabilityRouter = router({
  // Get availability for the current sitter for a given month
  getMyMonth: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2024).max(2030),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can manage availability",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const startDate = `${input.year}-${String(input.month).padStart(2, "0")}-01`;
      const endDay = new Date(input.year, input.month, 0).getDate();
      const endDate = `${input.year}-${String(input.month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      const rows = await db
        .select({
          id: sitterAvailability.id,
          date: sitterAvailability.date,
          status: sitterAvailability.status,
        })
        .from(sitterAvailability)
        .where(
          and(
            eq(sitterAvailability.sitterId, ctx.user.id),
            gte(sitterAvailability.date, startDate),
            lte(sitterAvailability.date, endDate)
          )
        );

      return rows;
    }),

  // Set availability for specific dates (upsert)
  setDates: protectedProcedure
    .input(
      z.object({
        dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
        status: z.enum(["available", "unavailable"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can manage availability",
        });
      }

      if (input.dates.length === 0) {
        return { success: true, count: 0 };
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Delete existing entries for these dates, then insert new ones
      await db
        .delete(sitterAvailability)
        .where(
          and(
            eq(sitterAvailability.sitterId, ctx.user.id),
            inArray(sitterAvailability.date, input.dates)
          )
        );

      const values = input.dates.map((date) => ({
        sitterId: ctx.user.id,
        date,
        status: input.status as "available" | "unavailable",
      }));

      await db.insert(sitterAvailability).values(values);

      return { success: true, count: input.dates.length };
    }),

  // Remove availability entries for specific dates (reset to unset)
  removeDates: protectedProcedure
    .input(
      z.object({
        dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can manage availability",
        });
      }

      if (input.dates.length === 0) {
        return { success: true };
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .delete(sitterAvailability)
        .where(
          and(
            eq(sitterAvailability.sitterId, ctx.user.id),
            inArray(sitterAvailability.date, input.dates)
          )
        );

      return { success: true };
    }),

  // Public: Get availability for a specific sitter (for owners to view)
  getForSitter: publicProcedure
    .input(
      z.object({
        sitterId: z.string(),
        year: z.number().min(2024).max(2030),
        month: z.number().min(1).max(12),
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

      const sitterIdBig = BigInt(input.sitterId);
      const startDate = `${input.year}-${String(input.month).padStart(2, "0")}-01`;
      const endDay = new Date(input.year, input.month, 0).getDate();
      const endDate = `${input.year}-${String(input.month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      const rows = await db
        .select({
          date: sitterAvailability.date,
          status: sitterAvailability.status,
        })
        .from(sitterAvailability)
        .where(
          and(
            eq(sitterAvailability.sitterId, sitterIdBig),
            gte(sitterAvailability.date, startDate),
            lte(sitterAvailability.date, endDate)
          )
        );

      return rows;
    }),

  // Get availability summary for a sitter (next 30 days count)
  getSummary: publicProcedure
    .input(z.object({ sitterId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterIdBig = BigInt(input.sitterId);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const future = new Date(today);
      future.setDate(future.getDate() + 30);
      const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;

      const rows = await db
        .select({
          status: sitterAvailability.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(sitterAvailability)
        .where(
          and(
            eq(sitterAvailability.sitterId, sitterIdBig),
            gte(sitterAvailability.date, todayStr),
            lte(sitterAvailability.date, futureStr)
          )
        )
        .groupBy(sitterAvailability.status);

      const available = rows.find((r) => r.status === "available")?.count ?? 0;
      const unavailable = rows.find((r) => r.status === "unavailable")?.count ?? 0;

      return { availableDays: Number(available), unavailableDays: Number(unavailable) };
    }),
});
