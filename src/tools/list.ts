import { getDb } from "@/config/database";
import { tool } from "langchain";
import { ObjectId } from "mongodb";
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
  return JSON.stringify(lists);
}, {
  name: 'get_all_lists',
  description: 'Obtém todas as listas de tarefas',
});

const deleteListTool = tool(async (input) => {
  const db = await getDb();
  const { id } = input;
  await db.collection('lists').deleteOne({ _id: new ObjectId(id) });
  return { message: 'Lista deletada com sucesso' };
}, {
  name: 'delete_list',
  description: 'Deleta uma lista de tarefas',
  schema: z.object({
    id: z.string().describe('O ID da lista a ser deletada'),
  }),
});

export {
  createListTool,
  getAllListsTool,
  deleteListTool,
};