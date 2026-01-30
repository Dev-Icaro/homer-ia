import { Elysia } from "elysia";
import agent from "@/agent";
import { sendTextMessage } from "@/services/whatsapp-service";
import { env } from "@/config/env";
import "@/config/secrets";
import { mongoPlugin } from "./plugins/mongoPlugin";

type WahaWebhookBody = {
  event?: string;
  payload?: {
    body?: string;
    from?: string;
  };
};

const port = env.APP_PORT;

export const app = new Elysia()
  .use(mongoPlugin)
  .get("/", () => ({
    success: true,
    message: "Hello world",
  }))
  .get("/health", async ({ db }) => {
    await db.command({ ping: 1 });
    return { success: true, message: "Healthy" };
  })
  .post('/waha/webhook', async ({ body }) => {
    const webhookBody = body as WahaWebhookBody;
    if (webhookBody.event === 'message.any') {
      const payload = webhookBody.payload ?? {};
      const config = {
        configurable: { thread_id: "1" },
        context: { user_id: "1" },
      };
      
      const response = await agent.invoke(
        { messages: [{ role: "user", content: payload.body ?? "" }] },
        config
      );

      const lastMessage = Array.isArray(response?.messages)
        ? (response.messages.at(-1) as { content?: unknown } | undefined)
        : undefined;
      const replyRaw =
        lastMessage?.content ??
        (response as { content?: unknown } | undefined)?.content ??
        response;
      const replyText =
        typeof replyRaw === "string" ? replyRaw : String(replyRaw ?? "");
      const chatId = payload.from;

      if (chatId && replyText.trim().length > 0) {
        await sendTextMessage({
          chatId,
          text: replyText.trim(),
        });
      }
    }
    
    return {
      success: true,
      message: "Webhook received",
    };
  })
  .listen(port);

console.log(`Server is running at http://localhost:${port}`);

