import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = {
  reqId: string;
  startTime: number;
  userId?: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

const setRequestContext = (context: RequestContext) => {
  storage.enterWith(context);
};

const getRequestContext = () => storage.getStore();

const getReqId = () => storage.getStore()?.reqId;

export { setRequestContext, getRequestContext, getReqId };

