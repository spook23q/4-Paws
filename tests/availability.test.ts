import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sitter Availability Feature", () => {
  describe("Database Schema", () => {
    const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    it("should have sitter_availability table defined", () => {
      expect(schema).toContain("sitterAvailability");
      expect(schema).toContain("sitter_availability");
    });

    it("should have sitter_id foreign key column", () => {
      expect(schema).toContain("sitterId: bigint(\"sitter_id\"");
    });

    it("should have date column as varchar(10) for YYYY-MM-DD", () => {
      expect(schema).toContain("date: varchar(\"date\", { length: 10 })");
    });

    it("should have status enum with available and unavailable", () => {
      expect(schema).toContain("mysqlEnum(\"status\", [\"available\", \"unavailable\"])");
    });

    it("should have proper indexes for performance", () => {
      expect(schema).toContain("avail_sitter_idx");
      expect(schema).toContain("avail_date_idx");
      expect(schema).toContain("avail_sitter_date_idx");
    });

    it("should have sitterAvailabilityRelations defined", () => {
      expect(schema).toContain("sitterAvailabilityRelations");
    });

    it("should have availability relation in usersRelations", () => {
      expect(schema).toContain("availability: many(sitterAvailability)");
    });

    it("should export SitterAvailability and InsertSitterAvailability types", () => {
      expect(schema).toContain("export type SitterAvailability");
      expect(schema).toContain("export type InsertSitterAvailability");
    });
  });

  describe("Availability Router", () => {
    const routerPath = path.join(__dirname, "../server/routers/availabilityRouter.ts");
    const routerCode = fs.readFileSync(routerPath, "utf-8");

    it("should export availabilityRouter", () => {
      expect(routerCode).toContain("export const availabilityRouter");
    });

    it("should have getMyMonth endpoint for sitters", () => {
      expect(routerCode).toContain("getMyMonth: protectedProcedure");
    });

    it("should validate year and month inputs for getMyMonth", () => {
      expect(routerCode).toContain("year: z.number().min(2024).max(2030)");
      expect(routerCode).toContain("month: z.number().min(1).max(12)");
    });

    it("should restrict getMyMonth to sitter role", () => {
      expect(routerCode).toContain('ctx.user.role !== "sitter"');
    });

    it("should have setDates endpoint for batch updates", () => {
      expect(routerCode).toContain("setDates: protectedProcedure");
    });

    it("should validate date format as YYYY-MM-DD", () => {
      expect(routerCode).toContain("z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)");
    });

    it("should accept available and unavailable status", () => {
      expect(routerCode).toContain('z.enum(["available", "unavailable"])');
    });

    it("should have removeDates endpoint to clear dates", () => {
      expect(routerCode).toContain("removeDates: protectedProcedure");
    });

    it("should have getForSitter public endpoint for owners", () => {
      expect(routerCode).toContain("getForSitter: publicProcedure");
    });

    it("should have getSummary endpoint for availability overview", () => {
      expect(routerCode).toContain("getSummary: publicProcedure");
    });

    it("should return availableDays and unavailableDays in summary", () => {
      expect(routerCode).toContain("availableDays");
      expect(routerCode).toContain("unavailableDays");
    });

    it("should use delete-then-insert pattern for upsert", () => {
      expect(routerCode).toContain(".delete(sitterAvailability)");
      expect(routerCode).toContain(".insert(sitterAvailability)");
    });
  });

  describe("Router Registration", () => {
    const routersPath = path.join(__dirname, "../server/routers.ts");
    const routers = fs.readFileSync(routersPath, "utf-8");

    it("should import availabilityRouter", () => {
      expect(routers).toContain('import { availabilityRouter } from "./routers/availabilityRouter"');
    });

    it("should register availability router in appRouter", () => {
      expect(routers).toContain("availability: availabilityRouter");
    });
  });

  describe("Sitter Availability Calendar Screen", () => {
    const screenPath = path.join(__dirname, "../app/profile/my-availability.tsx");
    const screen = fs.readFileSync(screenPath, "utf-8");

    it("should export default MyAvailabilityScreen", () => {
      expect(screen).toContain("export default function MyAvailabilityScreen");
    });

    it("should use ScreenContainer for proper layout", () => {
      expect(screen).toContain("<ScreenContainer");
    });

    it("should have month navigation (prev/next)", () => {
      expect(screen).toContain("goToPrevMonth");
      expect(screen).toContain("goToNextMonth");
    });

    it("should display days of week headers", () => {
      expect(screen).toContain("DAYS_OF_WEEK");
      expect(screen).toContain('"Mon"');
      expect(screen).toContain('"Sun"');
    });

    it("should query availability.getMyMonth", () => {
      expect(screen).toContain("trpc.availability.getMyMonth.useQuery");
    });

    it("should have available/unavailable selection mode toggle", () => {
      expect(screen).toContain("selectionMode");
      expect(screen).toContain('"available"');
      expect(screen).toContain('"unavailable"');
    });

    it("should call setDates mutation on apply", () => {
      expect(screen).toContain("trpc.availability.setDates.useMutation");
    });

    it("should call removeDates mutation for clearing", () => {
      expect(screen).toContain("trpc.availability.removeDates.useMutation");
    });

    it("should show summary counts for available and unavailable", () => {
      expect(screen).toContain("availableCount");
      expect(screen).toContain("unavailableCount");
    });

    it("should disable past dates", () => {
      expect(screen).toContain("isPastDate");
    });

    it("should highlight today's date", () => {
      expect(screen).toContain("isToday");
    });

    it("should show a legend for availability colors", () => {
      expect(screen).toContain("Available");
      expect(screen).toContain("Unavailable");
      expect(screen).toContain("Not set");
    });

    it("should have haptic feedback on interactions", () => {
      expect(screen).toContain("Haptics.impactAsync");
    });

    it("should restrict to sitter role only", () => {
      expect(screen).toContain('user.role !== "sitter"');
    });

    it("should have a back button to navigate back", () => {
      expect(screen).toContain("router.back()");
    });

    it("should show tip card with usage instructions", () => {
      expect(screen).toContain("Mark your available dates");
    });
  });

  describe("Profile Navigation Link", () => {
    const profilePath = path.join(__dirname, "../app/(tabs)/profile.tsx");
    const profile = fs.readFileSync(profilePath, "utf-8");

    it("should have My Availability link for sitters", () => {
      expect(profile).toContain("My Availability");
    });

    it("should navigate to /profile/my-availability", () => {
      expect(profile).toContain("/profile/my-availability");
    });

    it("should only show availability link for sitter role", () => {
      // The link is wrapped in user.role === "sitter" check
      expect(profile).toContain('user.role === "sitter"');
    });

    it("should use calendar icon for availability link", () => {
      expect(profile).toContain('name="calendar"');
    });
  });

  describe("Sitter Detail Availability Section", () => {
    const detailPath = path.join(__dirname, "../app/sitters/[id].tsx");
    const detail = fs.readFileSync(detailPath, "utf-8");

    it("should include SitterAvailabilitySection component", () => {
      expect(detail).toContain("SitterAvailabilitySection");
    });

    it("should query availability.getForSitter", () => {
      expect(detail).toContain("trpc.availability.getForSitter.useQuery");
    });

    it("should display month navigation in availability section", () => {
      expect(detail).toContain("goToPrevMonth");
      expect(detail).toContain("goToNextMonth");
    });

    it("should show available day count", () => {
      expect(detail).toContain("availableCount");
      expect(detail).toContain("day(s) available this month");
    });

    it("should show calendar grid with day cells", () => {
      expect(detail).toContain("calendarDays.map");
    });

    it("should show legend for available/unavailable", () => {
      // Legend in the availability section
      const availSection = detail.substring(detail.indexOf("SitterAvailabilitySection"));
      expect(availSection).toContain("Available");
      expect(availSection).toContain("Unavailable");
    });

    it("should highlight today's date", () => {
      expect(detail).toContain("isToday");
    });

    it("should dim past dates", () => {
      expect(detail).toContain("isPast");
    });
  });

  describe("Icon Mappings", () => {
    const iconPath = path.join(__dirname, "../components/ui/icon-symbol.tsx");
    const icons = fs.readFileSync(iconPath, "utf-8");

    it("should have calendar.badge.clock icon mapping", () => {
      expect(icons).toContain("calendar.badge.clock");
    });

    it("should have calendar.badge.exclamationmark icon mapping", () => {
      expect(icons).toContain("calendar.badge.exclamationmark");
    });
  });
});
