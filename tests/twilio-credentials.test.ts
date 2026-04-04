import { describe, it, expect } from "vitest";

describe("Twilio Credentials Validation", () => {
  it("should have TWILIO_ACCOUNT_SID set and properly formatted", () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    expect(sid).toBeDefined();
    expect(sid).not.toBe("");
    expect(sid?.startsWith("AC")).toBe(true);
    expect(sid?.length).toBeGreaterThanOrEqual(34);
  });

  it("should have TWILIO_AUTH_TOKEN set", () => {
    const token = process.env.TWILIO_AUTH_TOKEN;
    expect(token).toBeDefined();
    expect(token).not.toBe("");
    expect(token?.length).toBeGreaterThanOrEqual(20);
  });

  it("should be able to authenticate with Twilio API", async () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      throw new Error("Twilio credentials not set");
    }

    // Call the Twilio Accounts API to validate credentials
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        },
      }
    );

    // 200 = valid credentials, 401 = invalid
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.sid).toBe(sid);
    expect(data.status).toBe("active");
  });
});
