import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, User, SessionStrategy } from "next-auth";
import CredentialsProviderPkg from "next-auth/providers/credentials";

const CredentialsProvider: typeof CredentialsProviderPkg =
  (
    CredentialsProviderPkg as typeof CredentialsProviderPkg & {
      default?: typeof CredentialsProviderPkg;
    }
  ).default ?? CredentialsProviderPkg;

import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@southern-syntax/db";
import { authenticateUser } from "./service";
import type { CredentialsInput } from "./schemas";
import { getUserPermissions } from "./utils";
import type { UserPermissions } from "./next-auth"; // จาก module augmentation ของคุณ
import { getLogger } from "./logger";

// const { log, logError } = getLogger("options");
const { logError } = getLogger("options");

// const sessionStrategy: SessionStrategy = (() => {
//   // ถ้าไม่มี env หรือใส่ค่าแปลก ๆ ให้ fallback เป็น 'jwt'
//   const v = process.env.NEXTAUTH_SESSION_STRATEGY;
//   return v === "database" ? "database" : "jwt";
// })();

const sessionStrategy: SessionStrategy =
  process.env.NEXTAUTH_SESSION_STRATEGY === "database" ? "database" : "jwt";

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

// export const authOptions: NextAuthOptions = {
export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  // session: { strategy: "jwt" },
  session: { strategy: sessionStrategy },
  // session: { strategy: "jwt" as const },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // async authorize(credentials: CredentialsInput) {
        try {
          const authenticated = await authenticateUser(
            credentials as CredentialsInput
          );

          if (!authenticated) {
            throw new Error("INVALID_CREDENTIALS");
          }

          const userWithRole = await prisma.user.findUnique({
            where: { id: authenticated.id },
            include: { role: { select: { key: true } } },
          });

          if (userWithRole?.role) {
            const finalUser: User = {
              ...userWithRole,
              role: userWithRole.role,
            } as unknown as User; // cast ให้ตรง type NextAuth (ไม่ใช้ any)
            return finalUser;
          }

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
        } catch (err: unknown) {
          logError("[cb.jwt] getUserPermissions error", err);
        }
      }

      if (trigger === "update" && session?.user) {
        (token as { name: string | null }).name = session.user.name ?? null;
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

      return session;
    },
  },

  pages: { signIn: "/auth/signin" },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  // };
} satisfies NextAuthOptions;
