import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { complianceDocuments } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "../storage";

const DOCUMENT_TYPES = [
  "wwcc",
  "first_aid",
  "pet_first_aid",
  "animal_care_cert",
  "public_liability_insurance",
  "abn_registration",
  "other",
] as const;

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

export const complianceRouter = router({
  // Upload a compliance document
  upload: protectedProcedure
    .input(
      z.object({
        documentType: z.enum(DOCUMENT_TYPES),
        fileName: z.string().min(1).max(255),
        base64: z.string(),
        mimeType: z.string(),
        fileSize: z.number().max(MAX_FILE_SIZE, "File size must be under 10MB"),
        referenceNumber: z.string().max(255).optional(),
        issueDate: z.string().max(10).optional(),
        expiryDate: z.string().max(10).optional(),
        notes: z.string().max(1000).optional(),
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

      // Verify user is a sitter
      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can upload compliance documents",
        });
      }

      // Validate mime type
      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type. Accepted: JPEG, PNG, HEIC, PDF",
        });
      }

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64, "base64");

        // Generate unique file key
        const ext = input.mimeType === "application/pdf" ? "pdf" :
                    input.mimeType === "image/png" ? "png" :
                    input.mimeType === "image/heic" || input.mimeType === "image/heif" ? "heic" : "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `compliance-docs/${ctx.user.id}/${input.documentType}-${randomSuffix}.${ext}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save metadata to database
        const result = await db.insert(complianceDocuments).values({
          userId: ctx.user.id,
          documentType: input.documentType,
          fileName: input.fileName,
          fileUrl: url,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          referenceNumber: input.referenceNumber || null,
          issueDate: input.issueDate || null,
          expiryDate: input.expiryDate || null,
          notes: input.notes || null,
          verificationStatus: "pending",
        });

        return {
          success: true,
          id: result[0].insertId.toString(),
          url,
          verificationStatus: "pending" as const,
        };
      } catch (error: any) {
        console.error("[Compliance] Document upload failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  // List all compliance documents for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const docs = await db
      .select()
      .from(complianceDocuments)
      .where(eq(complianceDocuments.userId, ctx.user.id))
      .orderBy(desc(complianceDocuments.createdAt));

    return docs.map((doc) => ({
      id: doc.id.toString(),
      documentType: doc.documentType,
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
    }));
  }),

  // Get a single compliance document by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(
          and(
            eq(complianceDocuments.id, BigInt(input.id)),
            eq(complianceDocuments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      const doc = docs[0];
      return {
        id: doc.id.toString(),
        documentType: doc.documentType,
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
      };
    }),

  // Delete a compliance document
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(
          and(
            eq(complianceDocuments.id, BigInt(input.id)),
            eq(complianceDocuments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await db
        .delete(complianceDocuments)
        .where(eq(complianceDocuments.id, BigInt(input.id)));

      return { success: true };
    }),

  // Update document metadata (reference number, dates, notes)
  updateMetadata: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        referenceNumber: z.string().max(255).optional(),
        issueDate: z.string().max(10).optional(),
        expiryDate: z.string().max(10).optional(),
        notes: z.string().max(1000).optional(),
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

      // Verify ownership
      const docs = await db
        .select()
        .from(complianceDocuments)
        .where(
          and(
            eq(complianceDocuments.id, BigInt(input.id)),
            eq(complianceDocuments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      const updateData: Record<string, any> = {};
      if (input.referenceNumber !== undefined) updateData.referenceNumber = input.referenceNumber;
      if (input.issueDate !== undefined) updateData.issueDate = input.issueDate;
      if (input.expiryDate !== undefined) updateData.expiryDate = input.expiryDate;
      if (input.notes !== undefined) updateData.notes = input.notes;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(complianceDocuments)
          .set(updateData)
          .where(eq(complianceDocuments.id, BigInt(input.id)));
      }

      return { success: true };
    }),

  // Get compliance summary (for dashboard display)
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalDocuments: 0,
        pendingVerification: 0,
        verified: 0,
        rejected: 0,
        expired: 0,
        documentTypes: {} as Record<string, { status: string; count: number }>,
      };
    }

    const docs = await db
      .select()
      .from(complianceDocuments)
      .where(eq(complianceDocuments.userId, ctx.user.id));

    const summary = {
      totalDocuments: docs.length,
      pendingVerification: docs.filter((d) => d.verificationStatus === "pending").length,
      verified: docs.filter((d) => d.verificationStatus === "verified").length,
      rejected: docs.filter((d) => d.verificationStatus === "rejected").length,
      expired: docs.filter((d) => d.verificationStatus === "expired").length,
      documentTypes: {} as Record<string, { status: string; count: number }>,
    };

    // Group by document type — show latest status for each type
    for (const doc of docs) {
      const existing = summary.documentTypes[doc.documentType];
      if (!existing || new Date(doc.createdAt) > new Date(existing.status)) {
        summary.documentTypes[doc.documentType] = {
          status: doc.verificationStatus,
          count: docs.filter((d) => d.documentType === doc.documentType).length,
        };
      }
    }

    return summary;
  }),
});
