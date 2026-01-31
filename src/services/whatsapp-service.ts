import { env } from "@/config/env";

type WahaConfig = {
  baseUrl: string;
  apiKey?: string;
  session: string;
};

type SendTextParams = {
  chatId: string;
  text: string;
  session?: string;
};

const getWahaConfig = (): WahaConfig => {
  return {
    baseUrl: env.WAHA_BASE_URL,
    apiKey: env.WAHA_API_KEY,
    session: env.WAHA_SESSION,
  };
};

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

export const sendTextMessage = async ({
  chatId,
  text,
  session,
}: SendTextParams) => {
  console.log('Sending text message to', chatId, 'with text', text);
  const config = getWahaConfig();
  const response = await fetch(`${config.baseUrl}/api/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey ? { "X-Api-Key": config.apiKey } : {}),
    },
    body: JSON.stringify({
      session: session ?? config.session,
      chatId,
      text,
    }),
  });

  if (!response.ok) {
    const payload = await parseJsonSafe(response);
    throw new Error(
      `WAHA sendText failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return parseJsonSafe(response);
};
