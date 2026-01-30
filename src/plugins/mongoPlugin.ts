import Elysia from "elysia";
import { getDb } from "@/config/database";

export const mongoPlugin = new Elysia({ name: "mongo" })
  .decorate("db", await getDb());
