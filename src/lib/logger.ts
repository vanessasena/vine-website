import { Logtail } from '@logtail/node';

const logtail = process.env.BETTERSTACK_SOURCE_TOKEN
  ? new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN)
  : null;

type LogContext = Record<string, unknown>;

/**
 * Structured logger for Better Stack.
 * Free tier – only sends: errors, auth failures, important requests.
 * Falls back to console when BETTERSTACK_SOURCE_TOKEN is not set.
 */
export const logger = {
  /**
   * Log an error (server errors, DB failures, unexpected exceptions)
   */
  error(message: string, context?: LogContext) {
    const payload = { ...context, timestamp: new Date().toISOString() };
    console.error(message, payload);
    logtail?.error(message, payload);
  },

  /**
   * Log an auth failure (invalid token, missing auth, forbidden access)
   */
  authFailure(message: string, context?: LogContext) {
    const payload = { ...context, category: 'auth', timestamp: new Date().toISOString() };
    console.warn(message, payload);
    logtail?.warn(message, payload);
  },

  /**
   * Log an important request (mutations: POST/PUT/DELETE that change data)
   */
  request(message: string, context?: LogContext) {
    const payload = { ...context, category: 'request', timestamp: new Date().toISOString() };
    logtail?.info(message, payload);
  },

  /**
   * Flush pending logs. Call in API routes before returning responses
   * on error paths to ensure logs are sent before the function exits.
   */
  async flush() {
    await logtail?.flush();
  },
};
