import { APILogEvent } from "lib/types/logger";
import { pinoLogger } from "./pino";
import { addLogEvent } from "lib/data/logging";
import { ExtendedSession } from "lib/types/auth";

async function apiRequest(
  type: APILogEvent,
  body: object,
  session: ExtendedSession
) {
  const payload = JSON.stringify(body);
  await addLogEvent(
    session.userID,
    session.username,
    type,
    payload === '""' ? "" : payload
  );
  pinoLogger.debug({ type, body });
}

const logger = {
  apiRequest,
  info: pinoLogger.info.bind(pinoLogger),
  debug: pinoLogger.debug.bind(pinoLogger),
  error: pinoLogger.error.bind(pinoLogger),
  warn: pinoLogger.warn.bind(pinoLogger),
  fatal: pinoLogger.fatal.bind(pinoLogger),
};

export default logger;
