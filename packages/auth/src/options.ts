import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@southern-syntax/db";
import { authenticateUser } from "./service";
import { CredentialsInput } from "./schemas";
import { getUserPermissions } from "./utils";
import type { UserPermissions } from "./next-auth"; // จาก module augmentation ของคุณ

const isDebug: boolean =
  process.env.NEXTAUTH_DEBUG === "true" ||
  process.env.NODE_ENV !== "production";

const log = (...args: unknown[]): void => {
  if (isDebug) console.log("[auth]", ...args);
};

const logError = (...args: unknown[]): void => {
  console.error("[auth]", ...args);
};

type RoleKey = { key: string };
type UserWithRole = User & { role?: RoleKey | null };
type TokenShape = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  permissions?: UserPermissions;
};

function isUserWithRole(u: unknown): u is UserWithRole {
  return (
    typeof u === "object" &&
    u !== null &&
    "role" in (u as Record<string, unknown>)
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "")
          .toString()
          .trim()
          .toLowerCase();
        log("[authorize] start", { email });

        try {
          const authenticated = await authenticateUser(
            credentials as CredentialsInput
          );

          // log("[authorize] authenticateUser", {
          //   ok: Boolean(authenticated),
          //   userId: authenticated?.id ?? null,
          //   role: authenticated?.role ?? null,
          // });

          if (!authenticated) {
            throw new Error("INVALID_CREDENTIALS");
          }

          const userWithRole = await prisma.user.findUnique({
            where: { id: authenticated.id },
            include: { role: { select: { key: true } } },
          });

          // log("[authorize] prisma.user.findUnique", {
          //   exists: Boolean(userWithRole),
          //   id: userWithRole?.id ?? null,
          //   role: userWithRole?.role?.key ?? null,
          //   isActive: userWithRole?.isActive ?? null,
          // });

          if (userWithRole?.role) {
            const finalUser: User = {
              ...userWithRole,
              role: userWithRole.role,
            } as unknown as User; // cast ให้ตรง type NextAuth (ไม่ใช้ any)
            // log("[authorize] success", {
            //   id: userWithRole.id,
            //   role: userWithRole.role.key,
            // });
            return finalUser;
          }

          // log("[authorize] fail: no role");
          return null;
        } catch (e: unknown) {
          logError("[authorize] error", e);
          throw e instanceof Error ? e : new Error("AUTHORIZE_ERROR");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // log("[cb.jwt] enter", {
      //   hasUser: Boolean(user),
      //   trigger,
      //   tokenRole: (token as { role?: string | null }).role ?? null,
      //   tokenId: (token as { id?: string | null }).id ?? null,
      // });

      if (isUserWithRole(user) && user.role) {
        try {
          const permissions: UserPermissions | null = await getUserPermissions(
            user.id
          );
          (token as TokenShape).id = user.id;
          (token as TokenShape).name = user.name ?? null;
          (token as TokenShape).email = user.email ?? null;
          (token as TokenShape).role = user.role.key ?? "";
          (token as TokenShape).permissions = permissions ?? {};

          // log("[cb.jwt] set-from-user", {
          //   tokenId: (token as { id?: string }).id ?? null,
          //   tokenRole: (token as { role?: string | null }).role ?? null,
          //   hasPerms: Boolean(
          //     (token as { permissions?: UserPermissions | null }).permissions
          //   ),
          // });
        } catch (err: unknown) {
          logError("[cb.jwt] getUserPermissions error", err);
        }
      }

      if (trigger === "update" && session?.user) {
        (token as { name: string | null }).name = session.user.name ?? null;
        // log("[cb.jwt] trigger=update -> name updated", {
        //   name: session.user.name ?? null,
        // });
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as TokenShape;

      if (session.user) {
        // ค่าที่ module augmentation กำหนดเป็น non-null -> ให้ fallback แน่ๆ
        session.user.id = t.id ?? "";
        session.user.name = t.name ?? null;
        session.user.email = t.email ?? null;
        session.user.role = t.role ?? "";
        session.user.permissions = t.permissions ?? {};
      }

      // log("[cb.session] built session", {
      //   id: session.user?.id ?? null,
      //   role: session.user?.role ?? null,
      //   hasPerms: Boolean(session.user?.permissions),
      // });
      return session;
    },
  },

  // events: {
  //   async signOut() {
  //     log("[events.signOut]");
  //   },
  //   async createUser(message) {
  //     log("[events.createUser]", { hasUser: Boolean(message.user) });
  //   },
  //   async session(message) {
  //     log("[events.session]", { hasSession: Boolean(message.session) });
  //   },
  // },

  // ✅ ใช้ logger สำหรับจับ error/warn/debug แทน events.error
  // logger: {
  //   error(code, metadata) {
  //     logError("[logger.error]", code, metadata);
  //   },
  //   warn(code) {
  //     log("[logger.warn]", code);
  //   },
  //   debug(code, metadata) {
  //     if (isDebug) log("[logger.debug]", code, metadata);
  //   },
  // },

  pages: { signIn: "/auth/signin" },
  debug: process.env.NEXTAUTH_DEBUG === "true",
};
