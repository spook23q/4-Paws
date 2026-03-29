import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./routers/authRouter";
import { profilesRouter } from "./routers/profilesRouter";
import { sittersRouter } from "./routers/sittersRouter";
import { bookingsRouter } from "./routers/bookingsRouter";
import { messagesRouter } from "./routers/messagesRouter";
import { reviewsRouter } from "./routers/reviewsRouter";
import { supportRouter } from "./routers/supportRouter";
import { chatbotRouter } from "./routers/chatbotRouter";
import { visionRouter } from "./routers/visionRouter";
import { stripeRouter } from "./routers/stripeRouter";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  profiles: profilesRouter,
  sitters: sittersRouter,
  bookings: bookingsRouter,
  messages: messagesRouter,
  reviews: reviewsRouter,
  support: supportRouter,
  chatbot: chatbotRouter,
  vision: visionRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
