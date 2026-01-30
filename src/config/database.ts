// src/infra/db/mongo.ts
import { MongoClient } from "mongodb";
import { DB_PASSWORD } from "./secrets";
import { env } from "./env";

let client: MongoClient | null = null;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
      auth: {
        username: env.MONGODB_USER,
        password: DB_PASSWORD,
      }
    });
    await client.connect();
  }
  return client;
}

export async function getDb() {
  const c = await getMongoClient();
  return c.db(env.MONGODB_DB);
}
