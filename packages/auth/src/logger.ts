const isDebug =
  process.env.NEXTAUTH_DEBUG === "true" ||
  process.env.NODE_ENV !== "production";

export function getLogger(scope: string) {
  const prefix = `[auth:${scope}]`;
  const log = (...args: unknown[]): void => {
    if (isDebug) console.log(prefix, ...args);
  };
  const logWarn = (...args: unknown[]): void => {
    console.warn(prefix, ...args);
  };
  const logError = (...args: unknown[]): void => {
    console.error(prefix, ...args);
  };
  return { log, logWarn, logError };
}
