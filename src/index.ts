import { tool, initChatModel, createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { z } from 'zod';

const checkpointer = new MemorySaver();

const systemPrompt = `
  Você é um assistente de IA que ajuda a gerenciar itens de casa
`;

const addTaskTool = tool((input) => console.log(input), {
  name: 'add_task',
  description: 'Adiciona uma tarefa a lista de casa',
  schema: z.object({
    task: z.string().describe('A tarefa a ser adicionada'),
  }),
});

const model = await initChatModel('llama-3.1-8b-instant', {
  modelProvider: 'groq',
});

const agent = createAgent({
  model,
  systemPrompt,
  checkpointer,
  tools: [addTaskTool],
});

const config = {
  configurable: { thread_id: "1" },
  context: { user_id: "1" },
};

const response = await agent.invoke(
  { messages: [{ role: "user", content: "Adicione a tarefa 'Comprar leite' à lista de casa" }] },
  config
);
console.log(response);
