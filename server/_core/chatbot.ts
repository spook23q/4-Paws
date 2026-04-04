import { invokeLLM } from "./llm";

// Chatbot knowledge base about 4 Paws app
const CHATBOT_SYSTEM_PROMPT = `You are PawsBot, a friendly and helpful AI assistant for the 4 Paws cat sitting marketplace app. Your role is to help users with:

1. **Booking Process**: Guide users through finding sitters, creating booking requests, and managing bookings
2. **Cat Care Advice**: Provide general cat care tips, feeding schedules, and behavior insights
3. **App Features**: Explain how to use messaging, profiles, reviews, and other app features
4. **Troubleshooting**: Help users resolve common issues

**Key App Information:**
- 4 Paws connects cat owners with trusted cat sitters in Sydney, Australia
- Owners can browse sitter profiles, view ratings, and request bookings
- Sitters set their own rates and availability
- All bookings include messaging between owners and sitters
- Push notifications keep users updated on booking status and messages

**Tone**: Friendly, warm, and helpful. Use cat emojis occasionally 🐱 but don't overdo it.

**Limitations**: 
- You cannot access user data, bookings, or perform actions on behalf of users
- For account-specific issues, direct users to contact support
- You provide general advice only, not veterinary medical advice

Always be concise and actionable in your responses.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getChatbotResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Prepare messages with system prompt
    const messages: ChatMessage[] = [
      { role: "system", content: CHATBOT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Call Manus LLM API
    const response = await invokeLLM({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) as any,
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("[Chatbot] Error generating response:", error);
    return "I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.";
  }
}

// Predefined quick responses for common questions
export const QUICK_RESPONSES = {
  "How do I book a sitter?": `To book a cat sitter:
1. Browse sitters on the Home screen
2. Tap on a sitter to view their profile
3. Check their availability and rates
4. Tap "Request Booking"
5. Select dates and add your cat details
6. Send the request!

The sitter will receive a notification and can accept or decline. You'll be notified either way! 🐱`,

  "What are your rates?": `Sitter rates vary! Each sitter sets their own pricing. You'll see:
- Price per day (daytime visits)
- Price per night (overnight stays)

Most sitters in Sydney charge between $30-70 per day. Rates depend on experience, services offered, and location.`,

  "How do I contact a sitter?": `You can message sitters directly through the app:
1. Go to your booking
2. Tap "Message Sitter"
3. Start chatting!

You'll receive push notifications for new messages, so you won't miss anything. 💬`,

  "Is my cat safe?": `Safety is our top priority! All sitters:
- Provide detailed profiles with experience
- Receive ratings and reviews from other owners
- Communicate directly with you before and during bookings
- Send photo updates (many sitters do this!)

Always read reviews and chat with sitters before booking to ensure they're the right fit for your cat. 🛡️`,

  "How do cancellations work?": `Cancellation policies:
- Owners can cancel pending requests anytime
- For confirmed bookings, contact your sitter directly
- Sitters can decline requests before accepting
- Be respectful of sitters' time!

We recommend discussing cancellation terms with your sitter before confirming. 📅`,
};

export function getQuickResponse(question: string): string | null {
  return QUICK_RESPONSES[question as keyof typeof QUICK_RESPONSES] || null;
}

export function getQuickQuestions(): string[] {
  return Object.keys(QUICK_RESPONSES);
}
