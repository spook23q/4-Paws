import { describe, it, expect, beforeAll } from "vitest";
import { getChatbotResponse, getQuickQuestions, getQuickResponse, QUICK_RESPONSES } from "../_core/chatbot";

describe("Chatbot", () => {
  describe("Quick Responses", () => {
    it("should return all quick questions", () => {
      const questions = getQuickQuestions();
      expect(questions).toBeInstanceOf(Array);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions).toContain("How do I book a sitter?");
    });

    it("should return quick response for known question", () => {
      const response = getQuickResponse("How do I book a sitter?");
      expect(response).toBeTruthy();
      expect(response).toContain("Browse sitters");
      expect(response).toContain("Request Booking");
    });

    it("should return null for unknown question", () => {
      const response = getQuickResponse("This is not a predefined question");
      expect(response).toBeNull();
    });

    it("should have responses for all quick questions", () => {
      const questions = getQuickQuestions();
      questions.forEach((question) => {
        const response = getQuickResponse(question);
        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
      });
    });
  });

  describe("AI Responses", () => {
    it("should generate response for user message", async () => {
      const response = await getChatbotResponse("What is 4 Paws?");
      expect(response).toBeTruthy();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(10);
    }, 30000); // 30 second timeout for LLM call

    it("should handle conversation history", async () => {
      const history = [
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi! How can I help you?" },
      ];
      const response = await getChatbotResponse("Tell me about cat care", history);
      expect(response).toBeTruthy();
      expect(typeof response).toBe("string");
    }, 30000);

    it("should handle errors gracefully", async () => {
      // Test with empty message
      const response = await getChatbotResponse("");
      expect(response).toBeTruthy();
      expect(typeof response).toBe("string");
    }, 30000);
  });

  describe("Quick Response Content", () => {
    it("should have booking instructions", () => {
      const response = QUICK_RESPONSES["How do I book a sitter?"];
      expect(response).toContain("Browse sitters");
      expect(response).toContain("Request Booking");
      expect(response).toContain("notification");
    });

    it("should have rate information", () => {
      const response = QUICK_RESPONSES["What are your rates?"];
      expect(response).toContain("sitter sets their own");
      expect(response).toContain("$30-70");
    });

    it("should have contact information", () => {
      const response = QUICK_RESPONSES["How do I contact a sitter?"];
      expect(response).toContain("Message Sitter");
      expect(response).toContain("push notifications");
    });

    it("should have safety information", () => {
      const response = QUICK_RESPONSES["Is my cat safe?"];
      expect(response).toContain("Safety");
      expect(response).toContain("ratings and reviews");
    });

    it("should have cancellation policy", () => {
      const response = QUICK_RESPONSES["How do cancellations work?"];
      expect(response).toContain("cancel");
      expect(response).toContain("contact your sitter");
    });
  });
});
