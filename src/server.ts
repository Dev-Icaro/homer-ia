import { Elysia } from "elysia";
import agent from "@/agent";
import { sendTextMessage } from "@/services/whatsapp-service";
import { env } from "@/config/env";
import "@/config/secrets";
import { mongoPlugin } from "./plugins/mongoPlugin";
import { requestLogger } from "@/plugins/requestLogger";
import logger from "./utils/logger";

type WahaWebhookBody = {
  event?: string;
  payload?: {
    body?: string;
    from?: string;
  };
};

const port = env.APP_PORT;

export const app = new Elysia()
  .use(requestLogger)
  .use(mongoPlugin)
  .get("/", () => ({
    success: true,
    message: "Hello world",
  }))
  .get("/health", async ({ db }) => {
    await db.command({ ping: 1 });
    return { success: true, message: "Healthy" };
  })
  .post("/waha/webhook", async ({ body }) => {
    const webhookBody = body as WahaWebhookBody;

    if (webhookBody.event === "message") {
      const payload = webhookBody.payload;

      const config = {
        configurable: { thread_id: "1" },
        context: { user_id: "1" },
      };

      if (payload?.body && payload.body.trim().length > 0) {
        logger.info(`Invoking agent for message: ${payload.body}`);
        try {
          const response = await agent.invoke(
            { messages: [{ role: "user", content: payload.body }] },
            config,
          );
  
          const lastMessage = response.messages.at(-1);
          const replyText = String(lastMessage?.content);
          const chatId = payload.from;
  
          if (chatId && replyText.trim().length > 0) {
            await sendTextMessage({
              chatId,
              text: replyText.trim(),
            });
          }
        } catch (error) {
          console.log(error);
          logger.error(`Error invoking agent: ${error}`);
        }
      }
    }

    return {
      success: true,
      message: "Webhook received",
    };
  })
  .listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
  });
