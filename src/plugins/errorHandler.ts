import logger from "@/utils/logger";
import { Elysia } from "elysia";

const errorHandler = new Elysia({ name: "error-handler" })
  .onError(({ error, code, set }) => {
    logger.error(error);

    // Pass to default elysia error handler
    if (code !== 'UNKNOWN') return;
      
    set.status = 500;
    return {
      status: 'error',
      message: 'Internal server error'
    }
  }).as('global');

export { errorHandler };