import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { LocalizedString } from "./i18n";

export type UserPermissions = {
  [resource: string]: {
    [action: string]: boolean;
  };
};

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      name: LocalizedString | string | null;
      permissions: UserPermissions;
    };
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    role?: { key: string } | null;
    name: LocalizedString | string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    role?: { key: string } | null;
    name: LocalizedString | string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    name: LocalizedString | string | null;
    permissions: UserPermissions;
  }
}

export {};
