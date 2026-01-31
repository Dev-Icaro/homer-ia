import { initChatModel, createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { createListTool, getAllListsTool } from './tools/list';
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const checkpointer = new MemorySaver();

const promptPath = fileURLToPath(
  new URL("./prompts/system-prompt.md", import.meta.url),
);
const systemPrompt = fs.readFileSync(promptPath, "utf8");

// const model = await initChatModel('llama-3.1-8b-instant', {
//   modelProvider: 'groq',
// });

const model = await initChatModel('gpt-5-nano', {
  modelProvider: 'openai',
});

const agent = createAgent({
  model,
  systemPrompt,
  checkpointer,
  tools: [createListTool, getAllListsTool],
});

export default agent;
