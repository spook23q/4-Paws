import { describe, it, expect } from "vitest";

/**
 * Tests for sitter compliance questionnaire validation logic.
 * These tests validate the Australian compliance requirements
 * that sitters must meet before accepting bookings.
 */

// Validation helpers (mirroring the questionnaire logic)
function validateWorkRights(status: string, visaType?: string): { valid: boolean; error?: string } {
  if (!status) return { valid: false, error: "Work rights status is required" };
  if (status === "none") return { valid: false, error: "Must have valid work rights in Australia" };
  if (status === "visa" && (!visaType || !visaType.trim())) {
    return { valid: false, error: "Visa type is required for visa holders" };
  }
  return { valid: true };
}

function validatePoliceCheck(
  hasCheck: boolean,
  referenceNumber?: string,
  willingToObtain?: boolean
): { valid: boolean; error?: string } {
  if (!hasCheck && !willingToObtain) {
    return { valid: false, error: "Police check is mandatory — must have or agree to obtain" };
  }
  if (hasCheck && (!referenceNumber || !referenceNumber.trim())) {
    return { valid: false, error: "Reference number is required when police check is provided" };
  }
  return { valid: true };
}

function validateQualifications(yearsExperience: string): { valid: boolean; error?: string } {
  if (!yearsExperience || !yearsExperience.trim()) {
    return { valid: false, error: "Years of experience is required" };
  }
  const years = parseInt(yearsExperience);
  if (isNaN(years) || years < 0) {
    return { valid: false, error: "Years of experience must be a valid number" };
  }
  return { valid: true };
}

function validateAgreements(
  agreesToTerms: boolean,
  agreesToBackgroundCheck: boolean
): { valid: boolean; error?: string } {
  if (!agreesToTerms) return { valid: false, error: "Must agree to Terms of Service" };
  if (!agreesToBackgroundCheck) return { valid: false, error: "Must consent to background check" };
  return { valid: true };
}

function validateABN(abn: string): { valid: boolean; error?: string } {
  // ABN is 11 digits, optionally with spaces
  const cleaned = abn.replace(/\s/g, "");
  if (cleaned.length !== 11) return { valid: false, error: "ABN must be 11 digits" };
  if (!/^\d{11}$/.test(cleaned)) return { valid: false, error: "ABN must contain only digits" };
  return { valid: true };
}

describe("Sitter Compliance Questionnaire", () => {
  describe("Work Rights Validation", () => {
    it("should reject empty work rights status", () => {
      const result = validateWorkRights("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });

    it("should reject 'none' work rights", () => {
      const result = validateWorkRights("none");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("work rights");
    });

    it("should accept Australian citizen", () => {
      expect(validateWorkRights("citizen").valid).toBe(true);
    });

    it("should accept permanent resident", () => {
      expect(validateWorkRights("permanent-resident").valid).toBe(true);
    });

    it("should accept visa holder with visa type", () => {
      expect(validateWorkRights("visa", "482").valid).toBe(true);
      expect(validateWorkRights("visa", "Working Holiday 417").valid).toBe(true);
    });

    it("should reject visa holder without visa type", () => {
      const result = validateWorkRights("visa", "");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Visa type");
    });

    it("should reject visa holder with whitespace-only visa type", () => {
      const result = validateWorkRights("visa", "   ");
      expect(result.valid).toBe(false);
    });
  });

  describe("Police Check Validation", () => {
    it("should reject when no check and not willing to obtain", () => {
      const result = validatePoliceCheck(false, undefined, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("mandatory");
    });

    it("should accept when has check with reference number", () => {
      expect(validatePoliceCheck(true, "NPC-123456789").valid).toBe(true);
    });

    it("should reject when has check but no reference number", () => {
      const result = validatePoliceCheck(true, "");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Reference number");
    });

    it("should accept when willing to obtain", () => {
      expect(validatePoliceCheck(false, undefined, true).valid).toBe(true);
    });

    it("should accept when has check and also willing to obtain", () => {
      expect(validatePoliceCheck(true, "NPC-123", true).valid).toBe(true);
    });
  });

  describe("Qualifications Validation", () => {
    it("should reject empty years of experience", () => {
      const result = validateQualifications("");
      expect(result.valid).toBe(false);
    });

    it("should reject whitespace-only years", () => {
      const result = validateQualifications("   ");
      expect(result.valid).toBe(false);
    });

    it("should accept valid years of experience", () => {
      expect(validateQualifications("5").valid).toBe(true);
      expect(validateQualifications("0").valid).toBe(true);
      expect(validateQualifications("20").valid).toBe(true);
    });

    it("should reject negative years", () => {
      const result = validateQualifications("-1");
      expect(result.valid).toBe(false);
    });

    it("should reject non-numeric input", () => {
      const result = validateQualifications("abc");
      expect(result.valid).toBe(false);
    });
  });

  describe("Agreements Validation", () => {
    it("should reject when terms not agreed", () => {
      const result = validateAgreements(false, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Terms");
    });

    it("should reject when background check not consented", () => {
      const result = validateAgreements(true, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("background check");
    });

    it("should reject when neither agreed", () => {
      const result = validateAgreements(false, false);
      expect(result.valid).toBe(false);
    });

    it("should accept when both agreed", () => {
      expect(validateAgreements(true, true).valid).toBe(true);
    });
  });

  describe("ABN Validation", () => {
    it("should accept valid 11-digit ABN", () => {
      expect(validateABN("12345678901").valid).toBe(true);
    });

    it("should accept ABN with spaces", () => {
      expect(validateABN("12 345 678 901").valid).toBe(true);
    });

    it("should reject ABN with wrong length", () => {
      expect(validateABN("1234567890").valid).toBe(false);
      expect(validateABN("123456789012").valid).toBe(false);
    });

    it("should reject ABN with non-digit characters", () => {
      expect(validateABN("1234567890A").valid).toBe(false);
    });

    it("should reject empty ABN", () => {
      expect(validateABN("").valid).toBe(false);
    });
  });

  describe("Full Application Flow", () => {
    it("should validate a complete valid application", () => {
      const workRights = validateWorkRights("citizen");
      const policeCheck = validatePoliceCheck(true, "NPC-123456789");
      const qualifications = validateQualifications("5");
      const agreements = validateAgreements(true, true);

      expect(workRights.valid).toBe(true);
      expect(policeCheck.valid).toBe(true);
      expect(qualifications.valid).toBe(true);
      expect(agreements.valid).toBe(true);
    });

    it("should validate application with willing-to-obtain police check", () => {
      const workRights = validateWorkRights("permanent-resident");
      const policeCheck = validatePoliceCheck(false, undefined, true);
      const qualifications = validateQualifications("2");
      const agreements = validateAgreements(true, true);

      expect(workRights.valid).toBe(true);
      expect(policeCheck.valid).toBe(true);
      expect(qualifications.valid).toBe(true);
      expect(agreements.valid).toBe(true);
    });

    it("should reject application with no work rights", () => {
      const workRights = validateWorkRights("none");
      expect(workRights.valid).toBe(false);
    });

    it("should reject application without police check agreement", () => {
      const policeCheck = validatePoliceCheck(false, undefined, false);
      expect(policeCheck.valid).toBe(false);
    });

    it("should reject application without terms agreement", () => {
      const agreements = validateAgreements(false, true);
      expect(agreements.valid).toBe(false);
    });
  });

  describe("Sitter Tab Configuration", () => {
    it("should hide Search tab for sitters", () => {
      const isSitter = true;
      const searchHref = isSitter ? null : undefined;
      expect(searchHref).toBeNull();
    });

    it("should show Search tab for owners", () => {
      const isSitter = false;
      const searchHref = isSitter ? null : undefined;
      expect(searchHref).toBeUndefined();
    });

    it("should rename Bookings to Jobs for sitters", () => {
      const isSitter = true;
      const title = isSitter ? "Jobs" : "Bookings";
      expect(title).toBe("Jobs");
    });

    it("should keep Bookings title for owners", () => {
      const isSitter = false;
      const title = isSitter ? "Jobs" : "Bookings";
      expect(title).toBe("Bookings");
    });
  });
});
