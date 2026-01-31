import { getDb } from "@/config/database";
import { tool } from "langchain";
import { z } from "zod";

const createListTool = tool(async (input) => {
  const db = await getDb();
  const { name } = input;
  const list = await db.collection('lists').insertOne({ name });
  return list;
}, {
  name: 'create_list',
  description: 'Cria uma nova lista de tarefas',
  schema: z.object({
    name: z.string().describe('O nome da lista a ser criada'),
  }),
});

const getAllListsTool = tool(async () => {
  const db = await getDb();
  const lists = await db.collection('lists').find().toArray();
  return lists;
}, {
  name: 'get_all_lists',
  description: 'Obtém todas as listas de tarefas',
});

export {
  createListTool,
  getAllListsTool,
};