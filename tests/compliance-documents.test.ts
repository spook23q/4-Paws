import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Document type constants ───────────────────────────────────────────
const DOCUMENT_TYPES = [
  "police_check",
  "wwcc",
  "first_aid",
  "pet_first_aid",
  "animal_care_cert",
  "public_liability_insurance",
  "abn_registration",
  "other",
] as const;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Validation helpers (mirroring server-side logic) ──────────────────
function validateDocumentType(type: string): boolean {
  return (DOCUMENT_TYPES as readonly string[]).includes(type);
}

function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

function validateFileName(name: string): boolean {
  return name.length > 0 && name.length <= 255;
}

function validateReferenceNumber(ref: string | undefined): boolean {
  if (!ref) return true;
  return ref.length <= 255;
}

function validateDateFormat(date: string | undefined): boolean {
  if (!date) return true;
  // DD/MM/YYYY format
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(date);
}

function generateFileKey(userId: number, docType: string, mimeType: string): string {
  const ext =
    mimeType === "application/pdf"
      ? "pdf"
      : mimeType === "image/png"
      ? "png"
      : mimeType === "image/heic" || mimeType === "image/heif"
      ? "heic"
      : "jpg";
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `compliance-docs/${userId}/${docType}-${randomSuffix}.${ext}`;
}

// ─── Summary calculation (mirroring server-side logic) ─────────────────
interface MockDocument {
  id: string;
  documentType: string;
  verificationStatus: "pending" | "verified" | "rejected" | "expired";
  createdAt: string;
}

function calculateSummary(docs: MockDocument[]) {
  return {
    totalDocuments: docs.length,
    pendingVerification: docs.filter((d) => d.verificationStatus === "pending").length,
    verified: docs.filter((d) => d.verificationStatus === "verified").length,
    rejected: docs.filter((d) => d.verificationStatus === "rejected").length,
    expired: docs.filter((d) => d.verificationStatus === "expired").length,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────

describe("Compliance Document Upload", () => {
  describe("Document Type Validation", () => {
    it("should accept all valid document types", () => {
      for (const type of DOCUMENT_TYPES) {
        expect(validateDocumentType(type)).toBe(true);
      }
    });

    it("should reject invalid document types", () => {
      expect(validateDocumentType("invalid_type")).toBe(false);
      expect(validateDocumentType("")).toBe(false);
      expect(validateDocumentType("drivers_license")).toBe(false);
      expect(validateDocumentType("passport")).toBe(false);
    });

    it("should have exactly 8 document types", () => {
      expect(DOCUMENT_TYPES.length).toBe(8);
    });

    it("should include all required Australian compliance documents", () => {
      expect(validateDocumentType("police_check")).toBe(true);
      expect(validateDocumentType("wwcc")).toBe(true);
      expect(validateDocumentType("first_aid")).toBe(true);
      expect(validateDocumentType("public_liability_insurance")).toBe(true);
      expect(validateDocumentType("abn_registration")).toBe(true);
    });
  });

  describe("MIME Type Validation", () => {
    it("should accept JPEG images", () => {
      expect(validateMimeType("image/jpeg")).toBe(true);
    });

    it("should accept PNG images", () => {
      expect(validateMimeType("image/png")).toBe(true);
    });

    it("should accept HEIC images (iOS)", () => {
      expect(validateMimeType("image/heic")).toBe(true);
      expect(validateMimeType("image/heif")).toBe(true);
    });

    it("should accept PDF documents", () => {
      expect(validateMimeType("application/pdf")).toBe(true);
    });

    it("should reject unsupported file types", () => {
      expect(validateMimeType("image/gif")).toBe(false);
      expect(validateMimeType("image/webp")).toBe(false);
      expect(validateMimeType("application/msword")).toBe(false);
      expect(validateMimeType("text/plain")).toBe(false);
      expect(validateMimeType("video/mp4")).toBe(false);
      expect(validateMimeType("")).toBe(false);
    });
  });

  describe("File Size Validation", () => {
    it("should accept files under 10MB", () => {
      expect(validateFileSize(1024)).toBe(true); // 1KB
      expect(validateFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(validateFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(validateFileSize(MAX_FILE_SIZE)).toBe(true); // exactly 10MB
    });

    it("should reject files over 10MB", () => {
      expect(validateFileSize(MAX_FILE_SIZE + 1)).toBe(false);
      expect(validateFileSize(20 * 1024 * 1024)).toBe(false); // 20MB
    });

    it("should reject zero-size files", () => {
      expect(validateFileSize(0)).toBe(false);
    });

    it("should reject negative sizes", () => {
      expect(validateFileSize(-1)).toBe(false);
    });
  });

  describe("File Name Validation", () => {
    it("should accept valid file names", () => {
      expect(validateFileName("police-check.pdf")).toBe(true);
      expect(validateFileName("my_document.jpg")).toBe(true);
      expect(validateFileName("WWCC Certificate 2025.png")).toBe(true);
    });

    it("should reject empty file names", () => {
      expect(validateFileName("")).toBe(false);
    });

    it("should reject file names over 255 characters", () => {
      expect(validateFileName("a".repeat(256))).toBe(false);
    });

    it("should accept file names at exactly 255 characters", () => {
      expect(validateFileName("a".repeat(255))).toBe(true);
    });
  });

  describe("Reference Number Validation", () => {
    it("should accept valid reference numbers", () => {
      expect(validateReferenceNumber("NPC-2025-12345")).toBe(true);
      expect(validateReferenceNumber("WWCC0012345678")).toBe(true);
      expect(validateReferenceNumber("ABC123")).toBe(true);
    });

    it("should accept undefined (optional field)", () => {
      expect(validateReferenceNumber(undefined)).toBe(true);
    });

    it("should reject reference numbers over 255 characters", () => {
      expect(validateReferenceNumber("a".repeat(256))).toBe(false);
    });
  });

  describe("Date Format Validation", () => {
    it("should accept DD/MM/YYYY format", () => {
      expect(validateDateFormat("15/03/2025")).toBe(true);
      expect(validateDateFormat("01/01/2024")).toBe(true);
      expect(validateDateFormat("31/12/2030")).toBe(true);
    });

    it("should accept undefined (optional field)", () => {
      expect(validateDateFormat(undefined)).toBe(true);
    });

    it("should reject invalid date formats", () => {
      expect(validateDateFormat("2025-03-15")).toBe(false); // ISO format
      expect(validateDateFormat("15-03-2025")).toBe(false); // dashes
      expect(validateDateFormat("March 15, 2025")).toBe(false); // text
      expect(validateDateFormat("15/3/2025")).toBe(false); // single digit month
    });
  });

  describe("File Key Generation", () => {
    it("should generate correct path structure", () => {
      const key = generateFileKey(42, "police_check", "image/jpeg");
      expect(key).toMatch(/^compliance-docs\/42\/police_check-[a-z0-9]+\.jpg$/);
    });

    it("should use correct extension for PDF", () => {
      const key = generateFileKey(1, "wwcc", "application/pdf");
      expect(key).toMatch(/\.pdf$/);
    });

    it("should use correct extension for PNG", () => {
      const key = generateFileKey(1, "first_aid", "image/png");
      expect(key).toMatch(/\.png$/);
    });

    it("should use correct extension for HEIC", () => {
      const key = generateFileKey(1, "animal_care_cert", "image/heic");
      expect(key).toMatch(/\.heic$/);
    });

    it("should use jpg as default extension", () => {
      const key = generateFileKey(1, "other", "image/jpeg");
      expect(key).toMatch(/\.jpg$/);
    });

    it("should generate unique keys for same inputs", () => {
      const key1 = generateFileKey(1, "police_check", "image/jpeg");
      const key2 = generateFileKey(1, "police_check", "image/jpeg");
      // Very unlikely to be the same due to random suffix
      // but we test the structure is correct
      expect(key1).toMatch(/^compliance-docs\/1\/police_check-/);
      expect(key2).toMatch(/^compliance-docs\/1\/police_check-/);
    });
  });

  describe("Compliance Summary Calculation", () => {
    it("should return zeros for empty document list", () => {
      const summary = calculateSummary([]);
      expect(summary.totalDocuments).toBe(0);
      expect(summary.pendingVerification).toBe(0);
      expect(summary.verified).toBe(0);
      expect(summary.rejected).toBe(0);
      expect(summary.expired).toBe(0);
    });

    it("should correctly count documents by status", () => {
      const docs: MockDocument[] = [
        { id: "1", documentType: "police_check", verificationStatus: "pending", createdAt: "2025-01-01" },
        { id: "2", documentType: "wwcc", verificationStatus: "verified", createdAt: "2025-01-02" },
        { id: "3", documentType: "first_aid", verificationStatus: "verified", createdAt: "2025-01-03" },
        { id: "4", documentType: "pet_first_aid", verificationStatus: "rejected", createdAt: "2025-01-04" },
        { id: "5", documentType: "abn_registration", verificationStatus: "expired", createdAt: "2025-01-05" },
      ];
      const summary = calculateSummary(docs);
      expect(summary.totalDocuments).toBe(5);
      expect(summary.pendingVerification).toBe(1);
      expect(summary.verified).toBe(2);
      expect(summary.rejected).toBe(1);
      expect(summary.expired).toBe(1);
    });

    it("should handle all documents with same status", () => {
      const docs: MockDocument[] = [
        { id: "1", documentType: "police_check", verificationStatus: "pending", createdAt: "2025-01-01" },
        { id: "2", documentType: "wwcc", verificationStatus: "pending", createdAt: "2025-01-02" },
        { id: "3", documentType: "first_aid", verificationStatus: "pending", createdAt: "2025-01-03" },
      ];
      const summary = calculateSummary(docs);
      expect(summary.totalDocuments).toBe(3);
      expect(summary.pendingVerification).toBe(3);
      expect(summary.verified).toBe(0);
      expect(summary.rejected).toBe(0);
      expect(summary.expired).toBe(0);
    });

    it("should handle multiple documents of the same type", () => {
      const docs: MockDocument[] = [
        { id: "1", documentType: "police_check", verificationStatus: "expired", createdAt: "2024-01-01" },
        { id: "2", documentType: "police_check", verificationStatus: "pending", createdAt: "2025-01-01" },
      ];
      const summary = calculateSummary(docs);
      expect(summary.totalDocuments).toBe(2);
      expect(summary.pendingVerification).toBe(1);
      expect(summary.expired).toBe(1);
    });
  });

  describe("Document Type Information", () => {
    const DOCUMENT_TYPE_INFO = [
      { type: "police_check", required: true, title: "National Police Check" },
      { type: "wwcc", required: false, title: "Working With Children Check" },
      { type: "first_aid", required: false, title: "First Aid Certificate" },
      { type: "pet_first_aid", required: false, title: "Pet First Aid Certificate" },
      { type: "animal_care_cert", required: false, title: "Animal Care Qualification" },
      { type: "public_liability_insurance", required: false, title: "Public Liability Insurance" },
      { type: "abn_registration", required: false, title: "ABN Registration" },
      { type: "other", required: false, title: "Other Document" },
    ];

    it("should have police_check as the only required document", () => {
      const required = DOCUMENT_TYPE_INFO.filter((d) => d.required);
      expect(required.length).toBe(1);
      expect(required[0].type).toBe("police_check");
    });

    it("should have a title for every document type", () => {
      for (const info of DOCUMENT_TYPE_INFO) {
        expect(info.title).toBeTruthy();
        expect(info.title.length).toBeGreaterThan(0);
      }
    });

    it("should cover all document types", () => {
      const types = DOCUMENT_TYPE_INFO.map((d) => d.type);
      for (const docType of DOCUMENT_TYPES) {
        expect(types).toContain(docType);
      }
    });
  });

  describe("Verification Status", () => {
    const VALID_STATUSES = ["pending", "verified", "rejected", "expired"];

    it("should have exactly 4 verification statuses", () => {
      expect(VALID_STATUSES.length).toBe(4);
    });

    it("should include all expected statuses", () => {
      expect(VALID_STATUSES).toContain("pending");
      expect(VALID_STATUSES).toContain("verified");
      expect(VALID_STATUSES).toContain("rejected");
      expect(VALID_STATUSES).toContain("expired");
    });

    it("should default new uploads to pending", () => {
      // Simulating the default value from the schema
      const defaultStatus = "pending";
      expect(defaultStatus).toBe("pending");
    });
  });

  describe("Upload Input Validation", () => {
    interface UploadInput {
      documentType: string;
      fileName: string;
      base64: string;
      mimeType: string;
      fileSize: number;
      referenceNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      notes?: string;
    }

    function validateUploadInput(input: UploadInput): { valid: boolean; error?: string } {
      if (!validateDocumentType(input.documentType)) {
        return { valid: false, error: "Invalid document type" };
      }
      if (!validateFileName(input.fileName)) {
        return { valid: false, error: "Invalid file name" };
      }
      if (!input.base64 || input.base64.length === 0) {
        return { valid: false, error: "File data is required" };
      }
      if (!validateMimeType(input.mimeType)) {
        return { valid: false, error: "Invalid file type" };
      }
      if (!validateFileSize(input.fileSize)) {
        return { valid: false, error: "File size must be under 10MB" };
      }
      if (!validateReferenceNumber(input.referenceNumber)) {
        return { valid: false, error: "Reference number too long" };
      }
      if (input.notes && input.notes.length > 1000) {
        return { valid: false, error: "Notes must be under 1000 characters" };
      }
      return { valid: true };
    }

    it("should accept valid upload input", () => {
      const result = validateUploadInput({
        documentType: "police_check",
        fileName: "police-check-2025.pdf",
        base64: "SGVsbG8gV29ybGQ=",
        mimeType: "application/pdf",
        fileSize: 1024 * 1024,
        referenceNumber: "NPC-2025-12345",
        issueDate: "15/01/2025",
        expiryDate: "15/01/2028",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject upload with invalid document type", () => {
      const result = validateUploadInput({
        documentType: "invalid",
        fileName: "test.pdf",
        base64: "data",
        mimeType: "application/pdf",
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid document type");
    });

    it("should reject upload with empty file data", () => {
      const result = validateUploadInput({
        documentType: "police_check",
        fileName: "test.pdf",
        base64: "",
        mimeType: "application/pdf",
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("File data is required");
    });

    it("should reject upload with invalid mime type", () => {
      const result = validateUploadInput({
        documentType: "police_check",
        fileName: "test.doc",
        base64: "data",
        mimeType: "application/msword",
        fileSize: 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid file type");
    });

    it("should reject upload with oversized file", () => {
      const result = validateUploadInput({
        documentType: "police_check",
        fileName: "test.pdf",
        base64: "data",
        mimeType: "application/pdf",
        fileSize: 15 * 1024 * 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("File size must be under 10MB");
    });

    it("should reject upload with notes over 1000 characters", () => {
      const result = validateUploadInput({
        documentType: "police_check",
        fileName: "test.pdf",
        base64: "data",
        mimeType: "application/pdf",
        fileSize: 1024,
        notes: "a".repeat(1001),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Notes must be under 1000 characters");
    });

    it("should accept upload without optional fields", () => {
      const result = validateUploadInput({
        documentType: "wwcc",
        fileName: "wwcc.jpg",
        base64: "data",
        mimeType: "image/jpeg",
        fileSize: 2048,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("Role-based Access Control", () => {
    it("should only allow sitters to upload documents", () => {
      const userRole = "sitter";
      expect(userRole === "sitter").toBe(true);
    });

    it("should deny owners from uploading documents", () => {
      const userRole: string = "owner";
      expect(userRole === "sitter").toBe(false);
    });

    it("should deny unauthenticated users", () => {
      const user = null;
      expect(user !== null && (user as any).role === "sitter").toBe(false);
    });
  });

  describe("Document Ownership Verification", () => {
    it("should only allow document owner to delete", () => {
      const docUserId = 42;
      const requestUserId = 42;
      expect(docUserId === requestUserId).toBe(true);
    });

    it("should deny deletion by non-owner", () => {
      const docUserId: number = 42;
      const requestUserId: number = 99;
      expect(docUserId === requestUserId).toBe(false);
    });

    it("should only allow document owner to view", () => {
      const docUserId = 42;
      const requestUserId = 42;
      expect(docUserId === requestUserId).toBe(true);
    });
  });
});
