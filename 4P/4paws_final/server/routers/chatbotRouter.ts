import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getChatbotResponse, getQuickQuestions, getQuickResponse } from "../_core/chatbot";

export const chatbotRouter = router({
  // Send message to chatbot and get AI response
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if there's a quick response for this question
        const quickResponse = getQuickResponse(input.message);
        if (quickResponse) {
          return {
            message: quickResponse,
            isQuickResponse: true,
          };
        }

        // Get AI-generated response
        const response = await getChatbotResponse(input.message, input.conversationHistory);

        return {
          message: response,
          isQuickResponse: false,
        };
      } catch (error: any) {
        console.error("[ChatbotRouter] Error:", error);
        throw new Error("Failed to get chatbot response: " + error.message);
      }
    }),

  // Get list of quick question suggestions
  getQuickQuestions: publicProcedure.query(() => {
    return {
      questions: getQuickQuestions(),
    };
  }),
});
