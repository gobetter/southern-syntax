import prisma, { Prisma } from "@southern-syntax/db";
import type { PrismaTypes } from "@southern-syntax/db";
import { defaultLocale } from "@southern-syntax/config";

import type {
  AuthenticatedUser,
  LocalizedString,
  RegisteredUser,
} from "@southern-syntax/types";

import {
  CredentialsInput,
  credentialsSchema,
  registerSchema,
  RegisterInput,
} from "./schemas";
import { verifyPassword, hashPassword } from "./utils";

const isLocalizedString = (v: unknown): v is LocalizedString =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every(
    (x) => typeof x === "string"
  );

const toLocalizedOrString = (
  v: PrismaTypes.JsonValue | null
): LocalizedString | string | null => {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (isLocalizedString(v)) return v;
  return null; // เคร่งครัด: ถ้าเป็น number/boolean/array ให้ตัดทิ้ง
};

/**
 * Authenticates a user based on provided credentials.
 * This function performs runtime validation using Zod and verifies the password.
 * @param credentials The user's login credentials (email, password).
 * @returns The user object if authentication is successful, null otherwise.
 */

export async function authenticateUser(
  credentials: CredentialsInput
): Promise<AuthenticatedUser | null> {
  // 1. ตรวจสอบข้อมูล Credentials ด้วย Zod (Runtime Validation)
  const validatedCredentials = credentialsSchema.safeParse(credentials);

  if (!validatedCredentials.success) {
    // หากข้อมูลไม่ถูกต้อง, คุณสามารถโยน Error ที่มีรายละเอียดได้
    // หรือ return null เพื่อให้ NextAuth.js จัดการ Error พื้นฐาน
    // console.error('Invalid credentials:', validatedCredentials.error.flatten());
    return null;
  }

  const { email, password } = validatedCredentials.data;

  // 2. ค้นหาผู้ใช้จากฐานข้อมูล
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true, // บอกให้ Prisma ไปดึงข้อมูลจากตาราง Role มาด้วย
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Database connection error");
  }

  if (!user) {
    // หากไม่พบผู้ใช้, Return null
    return null;
  }

  // 3. ตรวจสอบว่าบัญชีผู้ใช้ Active หรือไม่
  if (!user.isActive) {
    // ถ้าไม่ Active, return null เพื่อไม่ให้ล็อกอินผ่าน
    // คุณอาจจะโยน Error ที่มีข้อความเฉพาะเจาะจงกว่านี้ก็ได้
    // เช่น throw new Error('ACCOUNT_INACTIVE');
    return null;
  }

  // 3. เปรียบเทียบรหัสผ่านที่ Hash ไว้
  // ตรวจสอบว่า user มี passwordHash และทำการเปรียบเทียบ
  if (!user.passwordHash) {
    return null; // ผู้ใช้ไม่มีรหัสผ่าน (อาจ Login ด้วย OAuth เท่านั้น)
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return null; // รหัสผ่านไม่ถูกต้อง
  }

  // 4. หาก Login สำเร็จ, Return User object
  // ควร return เฉพาะข้อมูลที่ปลอดภัยที่จะเปิดเผยใน JWT/Session
  return {
    id: user.id,
    // name: user.name,
    name: toLocalizedOrString(user.name),
    email: user.email ?? "",
    role: user.role?.key ?? null,
    // ในอนาคต: เพิ่ม roleId หรือ role/permissions ถ้าคุณต้องการเก็บใน JWT/Session
  };
}

/**
 * Registers a new user with hashed password.
 * ใช้การตรวจสอบข้อมูลด้วย Zod และจัดการ Error พื้นฐานให้ Route Handler
 */
export async function registerUser(
  input: RegisterInput
): Promise<RegisteredUser> {
  const data = registerSchema.parse(input);

  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // const hashedPassword = await hashPassword(data.password);

  // ตอนจะสร้าง user ให้เลือกเฉพาะ field ที่มีใน DB เท่านั้น
  // และ 'ไม่' ส่ง id เข้าไป เพื่อให้ฐานข้อมูล generate ให้เอง
  // return prisma.user.create({
  //   data: {
  //     email: data.email,
  //     // name: data.name,
  //     name: {
  //       [defaultLocale]: data.name, // ผลลัพธ์จะได้เป็น { "en": "ค่าที่ผู้ใช้กรอก" }
  //     },
  //     roleId: data.roleId,
  //     passwordHash: hashedPassword,
  //   },
  // });

  // const created = await prisma.user.create({
  //   data: {
  //     email: data.email,
  //     name: { [defaultLocale]: data.name },
  //     roleId: data.roleId ?? null,
  //     passwordHash: hashedPassword,
  //   },
  //   select: { id: true, email: true, name: true, roleId: true },
  // });

  // return {
  //   id: created.id,
  //   email: created.email,
  //   name: created.name as unknown as LocalizedString | string | null,
  //   roleId: created.roleId,
  // };

  try {
    const created = await prisma.user.create({
      data: {
        email,
        // ถ้ามีคอลัมน์ normalize แยก ให้ใส่ด้วย เช่น:
        // emailNormalized: email,
        name: { [defaultLocale]: data.name },
        roleId: data.roleId ?? null,
        passwordHash: await hashPassword(data.password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        isActive: true,
      },
    });

    return {
      id: created.id,
      email: created.email,
      name: created.name as unknown as LocalizedString | string | null,
      roleId: created.roleId,
      isActive: created.isActive,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    throw e;
  }
}
