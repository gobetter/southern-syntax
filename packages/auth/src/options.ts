import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@southern-syntax/db";

import { authenticateUser } from "./service";
import { CredentialsInput } from "./schemas";
import { getUserPermissions } from "./utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // เรียกใช้ service เพื่อยืนยันตัวตน (อีเมล/รหัสผ่าน)
        const authenticatedUser = await authenticateUser(
          credentials as CredentialsInput
        );

        if (!authenticatedUser) {
          throw new Error("invalid_credentials");
        }

        // เมื่อยืนยันตัวตนสำเร็จ ให้ดึงข้อมูล user จาก DB อีกครั้ง
        // เพื่อให้ได้ข้อมูลล่าสุดและ "include" relation ของ role เข้ามาด้วย
        const userWithRole = await prisma.user.findUnique({
          where: {
            id: authenticatedUser.id,
          },
          include: {
            role: {
              select: {
                key: true,
              },
            },
          },
        });

        if (userWithRole && userWithRole.role) {
          // ส่ง user object กลับไปทั้งก้อน โดยคงค่า name เป็น LocalizedString
          const finalUser: User = {
            ...userWithRole,
            role: userWithRole.role,
          } as User;

          return finalUser;
        }

        // ถ้าผู้ใช้ไม่มี role หรือเกิดข้อผิดพลาด ให้ return null
        return null;

        // ✅ return user object ที่ได้จาก Prisma โดยตรงเลย
        //    ซึ่งจะมี `name` เป็น Json และ `role` เป็น object
        // return userWithRole;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ส่วนที่ 1: การทำงานตอนล็อกอินครั้งแรก (เหมือนเดิม)
      if (user && user.role) {
        const permissions = await getUserPermissions(user.id);

        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.role = user.role.key ?? null;
        token.permissions = permissions ?? null;
      }

      // เมื่อมีการ update session
      if (trigger === "update" && session?.user) {
        // ✅ อัปเดต name ใน token ด้วย
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.role = token.role ?? null;
        session.user.permissions = token.permissions ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },

  debug: process.env.NODE_ENV === "development",
};
