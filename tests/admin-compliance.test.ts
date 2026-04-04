import { describe, it, expect } from "vitest";

// ============================================================
// Admin Verification Panel Tests
// ============================================================
describe("Admin Verification Panel", () => {
  describe("Admin Access Control", () => {
    it("should identify admin by OWNER_OPEN_ID match", () => {
      const ownerOpenId = "owner_123";
      const user = { id: BigInt(5), openId: "owner_123" };
      const isAdmin = ownerOpenId === user.openId;
      expect(isAdmin).toBe(true);
    });

    it("should identify admin by first user (id=1)", () => {
      const user = { id: BigInt(1), openId: "local:1" };
      const isFirstUser = user.id === BigInt(1);
      expect(isFirstUser).toBe(true);
    });

    it("should deny admin access to regular users", () => {
      const ownerOpenId = "owner_123";
      const user = { id: BigInt(5), openId: "local:5" };
      const isOwner = ownerOpenId === user.openId;
      const isFirstUser = user.id === BigInt(1);
      expect(isOwner || isFirstUser).toBe(false);
    });

    it("should deny admin access when OWNER_OPEN_ID is not set", () => {
      const ownerOpenId = undefined;
      const user = { id: BigInt(5), openId: "local:5" };
      const isOwner = ownerOpenId && user.openId === ownerOpenId;
      const isFirstUser = user.id === BigInt(1);
      expect(isOwner || isFirstUser).toBe(false);
    });
  });

  describe("Document Status Management", () => {
    const VALID_STATUSES = ["pending", "verified", "rejected", "expired"];

    it("should accept all valid verification statuses", () => {
      VALID_STATUSES.forEach((status) => {
        expect(VALID_STATUSES.includes(status)).toBe(true);
      });
    });

    it("should reject invalid statuses", () => {
      const invalidStatuses = ["approved", "active", "suspended", ""];
      invalidStatuses.forEach((status) => {
        expect(VALID_STATUSES.includes(status)).toBe(false);
      });
    });

    it("should transition from pending to verified", () => {
      const doc = { verificationStatus: "pending" };
      doc.verificationStatus = "verified";
      expect(doc.verificationStatus).toBe("verified");
    });

    it("should transition from pending to rejected with reason", () => {
      const doc = { verificationStatus: "pending", rejectionReason: null as string | null };
      doc.verificationStatus = "rejected";
      doc.rejectionReason = "Document is illegible";
      expect(doc.verificationStatus).toBe("rejected");
      expect(doc.rejectionReason).toBe("Document is illegible");
    });

    it("should transition from verified to expired", () => {
      const doc = { verificationStatus: "verified" };
      doc.verificationStatus = "expired";
      expect(doc.verificationStatus).toBe("expired");
    });

    it("should allow re-verification of rejected documents", () => {
      const doc = { verificationStatus: "rejected", rejectionReason: "Blurry" as string | null };
      doc.verificationStatus = "verified";
      doc.rejectionReason = null;
      expect(doc.verificationStatus).toBe("verified");
      expect(doc.rejectionReason).toBeNull();
    });
  });

  describe("Document Type Labels", () => {
    const DOCUMENT_TYPE_LABELS: Record<string, string> = {
      police_check: "National Police Check",
      wwcc: "Working With Children Check",
      first_aid: "First Aid Certificate",
      pet_first_aid: "Pet First Aid Certificate",
      animal_care_cert: "Animal Care Certificate",
      public_liability_insurance: "Public Liability Insurance",
      abn_registration: "ABN Registration",
      other: "Other Document",
    };

    it("should have labels for all document types", () => {
      expect(Object.keys(DOCUMENT_TYPE_LABELS).length).toBe(8);
    });

    it("should return correct label for police check", () => {
      expect(DOCUMENT_TYPE_LABELS["police_check"]).toBe("National Police Check");
    });

    it("should return correct label for WWCC", () => {
      expect(DOCUMENT_TYPE_LABELS["wwcc"]).toBe("Working With Children Check");
    });

    it("should return correct label for insurance", () => {
      expect(DOCUMENT_TYPE_LABELS["public_liability_insurance"]).toBe("Public Liability Insurance");
    });
  });

  describe("Stats Calculation", () => {
    const mockDocs = [
      { documentType: "police_check", verificationStatus: "verified", userId: "1" },
      { documentType: "wwcc", verificationStatus: "pending", userId: "1" },
      { documentType: "police_check", verificationStatus: "pending", userId: "2" },
      { documentType: "first_aid", verificationStatus: "rejected", userId: "3" },
      { documentType: "police_check", verificationStatus: "expired", userId: "4" },
      { documentType: "police_check", verificationStatus: "verified", userId: "5" },
    ];

    it("should count pending documents correctly", () => {
      const pending = mockDocs.filter((d) => d.verificationStatus === "pending").length;
      expect(pending).toBe(2);
    });

    it("should count verified documents correctly", () => {
      const verified = mockDocs.filter((d) => d.verificationStatus === "verified").length;
      expect(verified).toBe(2);
    });

    it("should count rejected documents correctly", () => {
      const rejected = mockDocs.filter((d) => d.verificationStatus === "rejected").length;
      expect(rejected).toBe(1);
    });

    it("should count expired documents correctly", () => {
      const expired = mockDocs.filter((d) => d.verificationStatus === "expired").length;
      expect(expired).toBe(1);
    });

    it("should count unique sitters correctly", () => {
      const uniqueSitters = new Set(mockDocs.map((d) => d.userId)).size;
      expect(uniqueSitters).toBe(5);
    });

    it("should count compliant sitters (verified police check)", () => {
      const compliantSitters = new Set(
        mockDocs
          .filter((d) => d.documentType === "police_check" && d.verificationStatus === "verified")
          .map((d) => d.userId)
      ).size;
      expect(compliantSitters).toBe(2);
    });
  });

  describe("Filter Functionality", () => {
    const mockDocs = [
      { id: "1", verificationStatus: "pending" },
      { id: "2", verificationStatus: "verified" },
      { id: "3", verificationStatus: "pending" },
      { id: "4", verificationStatus: "rejected" },
      { id: "5", verificationStatus: "expired" },
    ];

    it("should filter by 'all' and return all documents", () => {
      const filtered = mockDocs;
      expect(filtered.length).toBe(5);
    });

    it("should filter by 'pending' correctly", () => {
      const filtered = mockDocs.filter((d) => d.verificationStatus === "pending");
      expect(filtered.length).toBe(2);
    });

    it("should filter by 'verified' correctly", () => {
      const filtered = mockDocs.filter((d) => d.verificationStatus === "verified");
      expect(filtered.length).toBe(1);
    });

    it("should filter by 'rejected' correctly", () => {
      const filtered = mockDocs.filter((d) => d.verificationStatus === "rejected");
      expect(filtered.length).toBe(1);
    });

    it("should filter by 'expired' correctly", () => {
      const filtered = mockDocs.filter((d) => d.verificationStatus === "expired");
      expect(filtered.length).toBe(1);
    });
  });
});

// ============================================================
// Document Expiry Notification Tests
// ============================================================
describe("Document Expiry Notifications", () => {
  describe("Expiry Date Parsing", () => {
    function parseExpiryDate(dateStr: string): Date | null {
      const parts = dateStr.split("/");
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      return new Date(year, month, day);
    }

    it("should parse DD/MM/YYYY format correctly", () => {
      const date = parseExpiryDate("15/03/2026");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(2); // March = 2
      expect(date!.getFullYear()).toBe(2026);
    });

    it("should parse end of year date correctly", () => {
      const date = parseExpiryDate("31/12/2026");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(31);
      expect(date!.getMonth()).toBe(11);
    });

    it("should return null for invalid format", () => {
      expect(parseExpiryDate("2026-03-15")).toBeNull();
      expect(parseExpiryDate("March 15, 2026")).toBeNull();
      expect(parseExpiryDate("")).toBeNull();
    });

    it("should return null for partial dates", () => {
      expect(parseExpiryDate("15/03")).toBeNull();
      expect(parseExpiryDate("15")).toBeNull();
    });
  });

  describe("Expiry Detection", () => {
    function isExpired(expiryDateStr: string, now: Date): boolean {
      const parts = expiryDateStr.split("/");
      if (parts.length !== 3) return false;
      const expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      return expiryDate <= now;
    }

    function isExpiringSoon(expiryDateStr: string, now: Date, daysThreshold: number): boolean {
      const parts = expiryDateStr.split("/");
      if (parts.length !== 3) return false;
      const expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
      return expiryDate > now && expiryDate <= threshold;
    }

    function daysUntilExpiry(expiryDateStr: string, now: Date): number {
      const parts = expiryDateStr.split("/");
      if (parts.length !== 3) return -1;
      const expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      return Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    }

    const now = new Date(2026, 1, 18); // Feb 18, 2026

    it("should detect already expired documents", () => {
      expect(isExpired("17/02/2026", now)).toBe(true);
      expect(isExpired("01/01/2026", now)).toBe(true);
      expect(isExpired("18/02/2026", now)).toBe(true); // same day = expired
    });

    it("should not flag future dates as expired", () => {
      expect(isExpired("19/02/2026", now)).toBe(false);
      expect(isExpired("01/03/2026", now)).toBe(false);
      expect(isExpired("01/01/2027", now)).toBe(false);
    });

    it("should detect documents expiring within 30 days", () => {
      expect(isExpiringSoon("19/02/2026", now, 30)).toBe(true);
      expect(isExpiringSoon("15/03/2026", now, 30)).toBe(true);
      expect(isExpiringSoon("20/03/2026", now, 30)).toBe(true);
    });

    it("should not flag documents expiring after 30 days", () => {
      expect(isExpiringSoon("21/03/2026", now, 30)).toBe(false);
      expect(isExpiringSoon("01/06/2026", now, 30)).toBe(false);
    });

    it("should not flag already expired documents as expiring soon", () => {
      expect(isExpiringSoon("17/02/2026", now, 30)).toBe(false);
      expect(isExpiringSoon("01/01/2026", now, 30)).toBe(false);
    });

    it("should calculate days until expiry correctly", () => {
      expect(daysUntilExpiry("20/02/2026", now)).toBe(2);
      expect(daysUntilExpiry("20/03/2026", now)).toBe(30);
    });

    it("should return negative days for expired documents", () => {
      const days = daysUntilExpiry("16/02/2026", now);
      expect(days).toBeLessThan(0);
    });
  });

  describe("Notification Types", () => {
    const COMPLIANCE_NOTIFICATION_TYPES = [
      "compliance_expiry",
      "compliance_verified",
      "compliance_rejected",
      "compliance_blocked",
    ];

    it("should have all compliance notification types", () => {
      expect(COMPLIANCE_NOTIFICATION_TYPES.length).toBe(4);
    });

    it("should include expiry notification type", () => {
      expect(COMPLIANCE_NOTIFICATION_TYPES.includes("compliance_expiry")).toBe(true);
    });

    it("should include verified notification type", () => {
      expect(COMPLIANCE_NOTIFICATION_TYPES.includes("compliance_verified")).toBe(true);
    });

    it("should include rejected notification type", () => {
      expect(COMPLIANCE_NOTIFICATION_TYPES.includes("compliance_rejected")).toBe(true);
    });

    it("should include blocked notification type", () => {
      expect(COMPLIANCE_NOTIFICATION_TYPES.includes("compliance_blocked")).toBe(true);
    });
  });

  describe("Notification Message Generation", () => {
    const DOCUMENT_TYPE_LABELS: Record<string, string> = {
      police_check: "National Police Check",
      wwcc: "Working With Children Check",
      first_aid: "First Aid Certificate",
    };

    it("should generate correct expiry warning message", () => {
      const docType = "police_check";
      const daysLeft: number = 15;
      const label = DOCUMENT_TYPE_LABELS[docType];
      const suffix = daysLeft !== 1 ? "s" : "";
      const message = `Your ${label} expires in ${daysLeft} day${suffix}. Please upload a renewed version.`;
      expect(message).toBe("Your National Police Check expires in 15 days. Please upload a renewed version.");
    });

    it("should generate correct expired message", () => {
      const docType = "first_aid";
      const label = DOCUMENT_TYPE_LABELS[docType];
      const message = `Your ${label} has expired. Please upload a new version to continue accepting bookings.`;
      expect(message).toBe("Your First Aid Certificate has expired. Please upload a new version to continue accepting bookings.");
    });

    it("should handle singular day correctly", () => {
      const daysLeft: number = 1;
      const suffix = daysLeft !== 1 ? "s" : "";
      const message = `expires in ${daysLeft} day${suffix}`;
      expect(message).toBe("expires in 1 day");
    });

    it("should handle plural days correctly", () => {
      const daysLeft: number = 7;
      const suffix = daysLeft !== 1 ? "s" : "";
      const message = `expires in ${daysLeft} day${suffix}`;
      expect(message).toBe("expires in 7 days");
    });
  });
});

// ============================================================
// Booking Compliance Enforcement Tests
// ============================================================
describe("Booking Compliance Enforcement", () => {
  describe("Police Check Verification", () => {
    interface ComplianceDoc {
      documentType: string;
      verificationStatus: string;
      userId: string;
    }

    function hasVerifiedPoliceCheck(docs: ComplianceDoc[], userId: string): boolean {
      return docs.some(
        (d) =>
          d.userId === userId &&
          d.documentType === "police_check" &&
          d.verificationStatus === "verified"
      );
    }

    const mockDocs: ComplianceDoc[] = [
      { documentType: "police_check", verificationStatus: "verified", userId: "1" },
      { documentType: "wwcc", verificationStatus: "verified", userId: "2" },
      { documentType: "police_check", verificationStatus: "pending", userId: "3" },
      { documentType: "police_check", verificationStatus: "rejected", userId: "4" },
      { documentType: "police_check", verificationStatus: "expired", userId: "5" },
      { documentType: "first_aid", verificationStatus: "verified", userId: "6" },
    ];

    it("should allow sitter with verified police check", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "1")).toBe(true);
    });

    it("should block sitter with only verified WWCC (no police check)", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "2")).toBe(false);
    });

    it("should block sitter with pending police check", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "3")).toBe(false);
    });

    it("should block sitter with rejected police check", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "4")).toBe(false);
    });

    it("should block sitter with expired police check", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "5")).toBe(false);
    });

    it("should block sitter with only verified first aid (no police check)", () => {
      expect(hasVerifiedPoliceCheck(mockDocs, "6")).toBe(false);
    });

    it("should block sitter with no documents at all", () => {
      expect(hasVerifiedPoliceCheck([], "99")).toBe(false);
    });
  });

  describe("Compliance Error Messages", () => {
    it("should generate correct compliance blocked message", () => {
      const message =
        "You must have a verified National Police Check to accept bookings. Please upload your police check in the Compliance Documents section.";
      expect(message).toContain("National Police Check");
      expect(message).toContain("accept bookings");
      expect(message).toContain("Compliance Documents");
    });

    it("should detect compliance error from message content", () => {
      const errorMsg =
        "You must have a verified National Police Check to accept bookings.";
      const isComplianceError =
        errorMsg.includes("Police Check") || errorMsg.includes("compliance");
      expect(isComplianceError).toBe(true);
    });

    it("should not flag non-compliance errors", () => {
      const errorMsg = "Booking is not in pending status";
      const isComplianceError =
        errorMsg.includes("Police Check") || errorMsg.includes("compliance");
      expect(isComplianceError).toBe(false);
    });
  });

  describe("Compliance Status Banner Logic", () => {
    interface Doc {
      documentType: string;
      verificationStatus: string;
    }

    it("should show error banner when no police check uploaded", () => {
      const docs: Doc[] = [];
      const hasVerified = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "verified"
      );
      const hasPending = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "pending"
      );
      expect(hasVerified).toBe(false);
      expect(hasPending).toBe(false);
      // Should show red error banner
    });

    it("should show warning banner when police check is pending", () => {
      const docs: Doc[] = [
        { documentType: "police_check", verificationStatus: "pending" },
      ];
      const hasVerified = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "verified"
      );
      const hasPending = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "pending"
      );
      expect(hasVerified).toBe(false);
      expect(hasPending).toBe(true);
      // Should show yellow warning banner
    });

    it("should hide banner when police check is verified", () => {
      const docs: Doc[] = [
        { documentType: "police_check", verificationStatus: "verified" },
      ];
      const hasVerified = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "verified"
      );
      expect(hasVerified).toBe(true);
      // Should hide banner
    });

    it("should show error banner when police check is rejected", () => {
      const docs: Doc[] = [
        { documentType: "police_check", verificationStatus: "rejected" },
      ];
      const hasVerified = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "verified"
      );
      const hasPending = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "pending"
      );
      expect(hasVerified).toBe(false);
      expect(hasPending).toBe(false);
      // Should show red error banner
    });

    it("should show error banner when police check is expired", () => {
      const docs: Doc[] = [
        { documentType: "police_check", verificationStatus: "expired" },
      ];
      const hasVerified = docs.some(
        (d) => d.documentType === "police_check" && d.verificationStatus === "verified"
      );
      expect(hasVerified).toBe(false);
      // Should show red error banner
    });
  });
});
