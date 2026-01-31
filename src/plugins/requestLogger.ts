import Elysia from "elysia";
import logger from "@/utils/logger";
import { getRequestContext, setRequestContext } from "@/utils/request-context";


export const requestLogger = new Elysia({ name: "request-logger" })
  .onRequest(({ request }) => {
    const reqId = crypto.randomUUID();
    setRequestContext({ reqId, startTime: Date.now() });
    const path = new URL(request.url).pathname;

    const logObject = {
      type: 'request',
      method: request.method,
      path: path,
      body: request.body,
    }
    logger.http(JSON.stringify(logObject));
  })
  .onAfterResponse(({ set, request, path }) => {
    const reqContext = getRequestContext();
    const durationMs = reqContext ? Date.now() - reqContext.startTime : 0;

    const statusCode = set.status ?? 200;
    const logObject = {
      type: 'response',
      method: request.method,
      path: path,
      status: statusCode,
      duration: durationMs,
    }
    logger.http(JSON.stringify(logObject));
  }).as('global')

