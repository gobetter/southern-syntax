import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "./options";

/**
 * Convenience helper that wraps NextAuth's `getServerSession` with the
 * project's preconfigured `authOptions`.
 */
export function getServerAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export * from "./options";
export * from "./service";
export * from "./utils";
export { can } from "./permissions";
