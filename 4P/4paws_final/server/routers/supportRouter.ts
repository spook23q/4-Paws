import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const supportRouter = router({
  // AI chatbot for customer support
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: input.messages as any,
        });

        return {
          message: response.choices[0].message.content,
        };
      } catch (error: any) {
        throw new Error("Failed to get AI response: " + error.message);
      }
    }),
});
