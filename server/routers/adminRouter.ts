import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { complianceDocuments, users } from "../../drizzle/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { ENV } from "../_core/env";
import { notifyUser } from "../notificationHelpers";

/**
 * Admin access is determined by the OWNER_OPEN_ID env var.
 * The app owner (Kay) is the admin who can verify/reject documents.
 * Any user whose openId matches OWNER_OPEN_ID, or whose id is 1 (first registered user),
 * is considered an admin.
 */
function assertAdmin(user: { id: bigint; openId: string | null }) {
  const isOwner = ENV.ownerOpenId && user.openId === ENV.ownerOpenId;
  // Also allow the first user (id=1) as admin for local dev
  const isFirstUser = user.id === BigInt(1);
  if (!isOwner && !isFirstUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  wwcc: "Working With Children Check",
  first_aid: "First Aid Certificate",
  pet_first_aid: "Pet First Aid Certificate",
  animal_care_cert: "Animal Care Certificate",
  public_liability_insurance: "Public Liability Insurance",
  abn_registration: "ABN Registration",
  other: "Other Document",
};

export const adminRouter = router({
  // Check if current user is admin
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const isOwner = ENV.ownerOpenId && ctx.user.openId === ENV.ownerOpenId;
    const isFirstUser = ctx.user.id === BigInt(1);
    return { isAdmin: isOwner || isFirstUser };
  }),

  // List all compliance documents with sitter info (admin only)
  listDocuments: protectedProcedure
    .input(
      z.object({
        status: z.enum(["all", "pending", "verified", "rejected", "expired"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conditions: any[] = [];
      if (input.status !== "all") {
        conditions.push(eq(complianceDocuments.verificationStatus, input.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const docs = await db
        .select({
          id: complianceDocuments.id,
          userId: complianceDocuments.userId,
          documentType: complianceDocuments.documentType,
          fileName: complianceDocuments.fileName,
          fileUrl: complianceDocuments.fileUrl,
          fileSize: complianceDocuments.fileSize,
          mimeType: complianceDocuments.mimeType,
          referenceNumber: complianceDocuments.referenceNumber,
          issueDate: complianceDocuments.issueDate,
          expiryDate: complianceDocuments.expiryDate,
          notes: complianceDocuments.notes,
          verificationStatus: complianceDocuments.verificationStatus,
          rejectionReason: complianceDocuments.rejectionReason,
          createdAt: complianceDocuments.createdAt,
          updatedAt: complianceDocuments.updatedAt,
          sitterName: users.name,
          sitterEmail: users.email,
          sitterPhone: users.phone,
          sitterPhoto: users.profilePhoto,
        })
        .from(complianceDocuments)
        .innerJoin(users, eq(complianceDocuments.userId, users.id))
        .where(whereClause)
        .orderBy(desc(complianceDocuments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(complianceDocuments)
        .where(whereClause);

      return {
        documents: docs.map((doc) => ({
          id: doc.id.toString(),
          userId: doc.userId.toString(),
          documentType: doc.documentType,
          documentTypeLabel: DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          referenceNumber: doc.referenceNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          notes: doc.notes,
          verificationStatus: doc.verificationStatus,
          rejectionReason: doc.rejectionReason,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
          sitterName: doc.sitterName,
          sitterEmail: doc.sitterEmail,
          sitterPhone: doc.sitterPhone,
          sitterPhoto: doc.sitterPhoto,
        })),
        total: countResult[0]?.count ?? 0,
      };
    }),

  // Get dashboard stats (admin only)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    assertAdmin(ctx.user);

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const allDocs = await db.select().from(complianceDocuments);

    const pending = allDocs.filter((d) => d.verificationStatus === "pending").length;
    const verified = allDocs.filter((d) => d.verificationStatus === "verified").length;
    const rejected = allDocs.filter((d) => d.verificationStatus === "rejected").length;
    const expired = allDocs.filter((d) => d.verificationStatus === "expired").length;

    // Count unique sitters with documents
    const uniqueSitters = new Set(allDocs.map((d) => d.userId.toString())).size;

    // Count sitters with any verified document (compliant)
    const verifiedDocs = allDocs.filter(
      (d) => d.verificationStatus === "verified"
    );
    const compliantSitters = new Set(verifiedDocs.map((d) => d.userId.toString())).size;

    // Documents expiring within 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = allDocs.filter((d) => {
      if (!d.expiryDate) return false;
      // Parse DD/MM/YYYY format
      const parts = d.expiryDate.split("/");
      if (parts.length !== 3) return false;
      const expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalDocuments: allDocs.length,
      pending,
      verified,
      rejected,
      expired,
      expiringSoon,
      uniqueSitters,
      compliantSitters,
    };
  }),

  // Verify a compliance document (admin only)
  verifyDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const docId = BigInt(input.id);
      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(eq(complianceDocuments.id, docId))
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await db
        .update(complianceDocuments)
        .set({ verificationStatus: "verified", rejectionReason: null })
        .where(eq(complianceDocuments.id, docId));

      // Notify the sitter
      const docLabel = DOCUMENT_TYPE_LABELS[docs[0].documentType] || docs[0].documentType;
      try {
        await notifyUser({
          userId: docs[0].userId,
          type: "compliance_verified",
          title: "Document Verified",
          body: `Your ${docLabel} has been verified and approved.`,
          data: { documentId: input.id, documentType: docs[0].documentType },
        });
      } catch (error) {
        console.error("[Admin] Failed to send verification notification:", error);
      }

      return { success: true };
    }),

  // Reject a compliance document (admin only)
  rejectDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const docId = BigInt(input.id);
      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(eq(complianceDocuments.id, docId))
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await db
        .update(complianceDocuments)
        .set({ verificationStatus: "rejected", rejectionReason: input.reason })
        .where(eq(complianceDocuments.id, docId));

      // Notify the sitter
      const docLabel = DOCUMENT_TYPE_LABELS[docs[0].documentType] || docs[0].documentType;
      try {
        await notifyUser({
          userId: docs[0].userId,
          type: "compliance_rejected",
          title: "Document Rejected",
          body: `Your ${docLabel} has been rejected. Reason: ${input.reason}`,
          data: { documentId: input.id, documentType: docs[0].documentType, reason: input.reason },
        });
      } catch (error) {
        console.error("[Admin] Failed to send rejection notification:", error);
      }

      return { success: true };
    }),

  // Mark a document as expired (admin only)
  expireDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const docId = BigInt(input.id);
      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(eq(complianceDocuments.id, docId))
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await db
        .update(complianceDocuments)
        .set({ verificationStatus: "expired" })
        .where(eq(complianceDocuments.id, docId));

      // Notify the sitter
      const docLabel = DOCUMENT_TYPE_LABELS[docs[0].documentType] || docs[0].documentType;
      try {
        await notifyUser({
          userId: docs[0].userId,
          type: "compliance_expiry",
          title: "Document Expired",
          body: `Your ${docLabel} has been marked as expired. Please upload a new version.`,
          data: { documentId: input.id, documentType: docs[0].documentType },
        });
      } catch (error) {
        console.error("[Admin] Failed to send expiry notification:", error);
      }

      return { success: true };
    }),

  // Check expiring documents and send notifications (can be called periodically)
  checkExpiringDocuments: protectedProcedure.mutation(async ({ ctx }) => {
    assertAdmin(ctx.user);

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const allDocs = await db
      .select()
      .from(complianceDocuments)
      .where(
        or(
          eq(complianceDocuments.verificationStatus, "verified"),
          eq(complianceDocuments.verificationStatus, "pending")
        )
      );

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let notifiedCount = 0;
    let expiredCount = 0;

    for (const doc of allDocs) {
      if (!doc.expiryDate) continue;

      // Parse DD/MM/YYYY format
      const parts = doc.expiryDate.split("/");
      if (parts.length !== 3) continue;
      const expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));

      // Already expired — mark as expired
      if (expiryDate <= now) {
        await db
          .update(complianceDocuments)
          .set({ verificationStatus: "expired" })
          .where(eq(complianceDocuments.id, doc.id));

        const docLabel = DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType;
        try {
          await notifyUser({
            userId: doc.userId,
            type: "compliance_expiry",
            title: "Document Expired",
            body: `Your ${docLabel} has expired. Please upload a new version to continue accepting bookings.`,
            data: { documentId: doc.id.toString(), documentType: doc.documentType },
          });
          expiredCount++;
        } catch (error) {
          console.error("[Admin] Failed to send expiry notification:", error);
        }
        continue;
      }

      // Expiring within 30 days — send warning
      if (expiryDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        const docLabel = DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType;

        try {
          await notifyUser({
            userId: doc.userId,
            type: "compliance_expiry",
            title: "Document Expiring Soon",
            body: `Your ${docLabel} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}. Please upload a renewed version.`,
            data: {
              documentId: doc.id.toString(),
              documentType: doc.documentType,
              daysUntilExpiry,
            },
          });
          notifiedCount++;
        } catch (error) {
          console.error("[Admin] Failed to send expiry warning:", error);
        }
      }
    }

    return {
      success: true,
      notifiedCount,
      expiredCount,
      totalChecked: allDocs.length,
    };
  }),

  // Get compliance status for a specific sitter (admin only)
  getSitterCompliance: protectedProcedure
    .input(z.object({ sitterId: z.string() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx.user);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterIdBigInt = BigInt(input.sitterId);

      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(eq(complianceDocuments.userId, sitterIdBigInt))
        .orderBy(desc(complianceDocuments.createdAt));

      const sitter = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, sitterIdBigInt))
        .limit(1);

      const hasVerifiedDoc = docs.some(
        (d) => d.verificationStatus === "verified"
      );

      return {
        sitterName: sitter[0]?.name || "Unknown",
        sitterEmail: sitter[0]?.email || "Unknown",
        isCompliant: hasVerifiedDoc,
        documents: docs.map((doc) => ({
          id: doc.id.toString(),
          documentType: doc.documentType,
          documentTypeLabel: DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType,
          verificationStatus: doc.verificationStatus,
          expiryDate: doc.expiryDate,
          createdAt: doc.createdAt.toISOString(),
        })),
      };
    }),
});
