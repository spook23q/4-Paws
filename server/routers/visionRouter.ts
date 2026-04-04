import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const visionRouter = router({
  /**
   * Analyze a cat photo using AI vision
   */
  analyzeCatPhoto: publicProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const { imageUrl } = input;

      try {
        // Use LLM with vision capabilities to analyze the cat photo
        const prompt = `You are a cat expert and veterinarian assistant. Analyze this cat photo and provide:

1. **Breed Identification**: What breed or mix of breeds does this cat appear to be?
2. **Physical Characteristics**: Describe the cat's coat color, pattern, eye color, and notable features
3. **Health Observations**: Any visible health indicators (coat condition, body condition, etc.)
4. **Behavior Insights**: Based on the cat's posture and expression, what might their personality be like?
5. **Care Tips**: 2-3 specific care recommendations for this type of cat

Be friendly, informative, and use cat emojis where appropriate. Keep your response under 300 words.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
        });

        const analysis = response.choices[0]?.message?.content || "Unable to analyze image";

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("[Vision] Cat photo analysis failed:", error);
        return {
          success: false,
          analysis:
            "I'm having trouble analyzing this photo right now. Please make sure it's a clear photo of a cat and try again!",
        };
      }
    }),
});
