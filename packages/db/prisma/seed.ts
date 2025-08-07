import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/utils";
import {
  ROLE_NAMES,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "../src/lib/auth/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // --- 1. สร้าง Roles ---
  console.log("Seeding Roles...");
  const rolesToSeed = [
    {
      key: "ADMIN",
      name: { en: "Administrator", th: "ผู้ดูแลระบบ" },
      isSystem: true,
    },
    {
      key: "EDITOR",
      name: { en: "Editor", th: "ผู้แก้ไขเนื้อหา" },
      isSystem: true,
    },
    {
      key: "VIEWER",
      name: { en: "Viewer", th: "ผู้เข้าชม" },
      isSystem: true,
      isSelectableOnRegistration: true,
    },
    {
      key: ROLE_NAMES.SUPERADMIN,
      name: { en: "Super Administrator", th: "ผู้ดูแลระบบสูงสุด" },
      isSystem: true,
    },
  ];
  const roleMap = new Map<string, { id: string; key: string }>();
  for (const roleData of rolesToSeed) {
    const nameEnNormalized = roleData.name.en.trim().toLowerCase();
    const role = await prisma.role.upsert({
      where: { key: roleData.key },
      update: { name: roleData.name, nameEnNormalized },
      create: { ...roleData, nameEnNormalized },
    });
    roleMap.set(role.key, role);
  }

  console.log("✅ Roles seeded successfully.");

  // --- 2. สร้าง SUPER ADMIN USER ---
  console.log("Seeding Super Admin User...");
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      "Please define SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in your .env file"
    );
  }
  const superAdminRole = roleMap.get(ROLE_NAMES.SUPERADMIN)!;
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { roleId: superAdminRole.id },
    create: {
      email: superAdminEmail,
      name: {
        en: process.env.SUPERADMIN_NAME_EN || "Super Admin",
        th: process.env.SUPERADMIN_NAME_TH || "ผู้ดูแลระบบสูงสุด",
      },
      passwordHash: await hashPassword(superAdminPassword),
      roleId: superAdminRole.id,
      isActive: true,
    },
  });
  console.log(
    `✅ Super Admin user '${superAdminEmail}' has been created/updated.`
  );

  // --- 3. สร้างผู้ใช้ทดสอบ ---
  console.log("Seeding 40 test users...");

  const viewerRole = roleMap.get("VIEWER")!;
  if (!viewerRole) {
    throw new Error('"VIEWER" role not found. Cannot create test users.');
  }

  const testUsersData: Prisma.UserCreateManyInput[] = [];
  const testPassword = "password123";
  const hashedPassword = await hashPassword(testPassword);

  for (let i = 1; i <= 40; i++) {
    const userNumber = String(i).padStart(2, "0");
    testUsersData.push({
      email: `testuser${userNumber}@example.com`,
      name: { en: `Test User ${userNumber}`, th: `ผู้ใช้ทดสอบ ${userNumber}` },
      passwordHash: hashedPassword,
      roleId: viewerRole.id,
      isActive: true,
    });
  }
  await prisma.user.createMany({ data: testUsersData, skipDuplicates: true });
  console.log(`✅ Seeded ${testUsersData.length} test users.`);

  // --- 4. สร้าง Permissions ทั้งหมดจาก constants ---
  console.log("Seeding Permissions...");

  const permissionsToCreate: Prisma.PermissionCreateManyInput[] = [];

  for (const resource of Object.values(PERMISSION_RESOURCES)) {
    for (const action of Object.values(PERMISSION_ACTIONS)) {
      // Logic การกรอง Permission ที่ไม่จำเป็น
      if (
        (resource === PERMISSION_RESOURCES.ADMIN_DASHBOARD ||
          resource === PERMISSION_RESOURCES.AUDIT_LOG ||
          resource === PERMISSION_RESOURCES.SETTINGS) &&
        action !== PERMISSION_ACTIONS.READ
      ) {
        continue;
      }

      // ถ้าเป็น LANGUAGE ให้ข้าม DELETE action
      if (
        resource === PERMISSION_RESOURCES.LANGUAGE &&
        action === PERMISSION_ACTIONS.DELETE
      ) {
        continue;
      }

      permissionsToCreate.push({
        key: `${resource}:${action}`,
        action,
        resource,
        isSystem: true,
      });
    }
  }
  await prisma.permission.createMany({
    data: permissionsToCreate,
    skipDuplicates: true,
  });

  console.log(`✅ ${permissionsToCreate.length} permissions created/updated.`);

  // --- 5. ผูก Permissions เข้ากับ Roles ---
  console.log("Assigning permissions to roles...");
  const allPermissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  });

  // กำหนดสิทธิ์สำหรับแต่ละ Role ที่นี่ที่เดียว
  const permissionsForRole: Record<string, string[]> = {
    ADMIN: [
      // Dashboard
      "ADMIN_DASHBOARD:READ",
      // User Management (CRUD)
      "USER:CREATE",
      "USER:READ",
      "USER:UPDATE",
      "USER:DELETE",
      // Media
      "MEDIA:CREATE",
      "MEDIA:READ",
      "MEDIA:UPDATE",
      "MEDIA:DELETE",
      // Media Taxonomy
      "MEDIA_TAXONOMY:CREATE",
      "MEDIA_TAXONOMY:READ",
      "MEDIA_TAXONOMY:UPDATE",
      "MEDIA_TAXONOMY:DELETE",
      // Language (CRU)
      "LANGUAGE:CREATE",
      "LANGUAGE:READ",
      "LANGUAGE:UPDATE",
      // Settings (Read-only)
      "SETTINGS:READ",
      // ... (เพิ่มสิทธิ์สำหรับ Product, Post ฯลฯ ที่นี่)
    ],

    // EDITOR จัดการได้แค่ Content, Product, และ Media
    EDITOR: [
      "POST:CREATE",
      "POST:READ",
      "POST:UPDATE",
      "POST:DELETE",
      "POST_CATEGORY:CREATE",
      "POST_CATEGORY:READ",
      "POST_CATEGORY:UPDATE",
      "POST_CATEGORY:DELETE",
      "POST_TAG:CREATE",
      "POST_TAG:READ",
      "POST_TAG:UPDATE",
      "POST_TAG:DELETE",
      "PRODUCT:CREATE",
      "PRODUCT:READ",
      "PRODUCT:UPDATE",
      "PRODUCT:DELETE",
      "PRODUCT_CATEGORY:CREATE",
      "PRODUCT_CATEGORY:READ",
      "PRODUCT_CATEGORY:UPDATE",
      "PRODUCT_CATEGORY:DELETE",
      "PRODUCT_TAG:CREATE",
      "PRODUCT_TAG:READ",
      "PRODUCT_TAG:UPDATE",
      "PRODUCT_TAG:DELETE",
      "MEDIA:CREATE",
      "MEDIA:READ",
      "MEDIA:UPDATE",
      "MEDIA:DELETE",
      "MEDIA_TAXONOMY:CREATE",
      "MEDIA_TAXONOMY:READ",
      "MEDIA_TAXONOMY:UPDATE",
      "MEDIA_TAXONOMY:DELETE",
    ],

    // VIEWER อ่านได้อย่างเดียว
    VIEWER: [
      "POST:READ",
      "POST_CATEGORY:READ",
      "POST_TAG:READ",
      "PRODUCT:READ",
      "PRODUCT_CATEGORY:READ",
      "PRODUCT_TAG:READ",
      "MEDIA:READ",
      "MEDIA_TAXONOMY:READ",
    ],
  };

  for (const role of roleMap.values()) {
    const permissionKeys =
      role.key === ROLE_NAMES.SUPERADMIN
        ? allPermissions.map((p) => p.key) // Super Admin ได้ทุกสิทธิ์เสมอ
        : permissionsForRole[role.key];

    if (permissionKeys) {
      const permissionIds = allPermissions
        .filter((p) => permissionKeys.includes(p.key))
        .map((p) => p.id);

      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            deleteMany: {},
            create: permissionIds.map((id) => ({
              permission: { connect: { id } },
            })),
          },
        },
      });
      console.log(
        `- Assigned ${permissionIds.length} permissions to '${role.key}'.`
      );
    }
  }
  console.log("✅ Permissions assigned to roles successfully.");

  // --- ✅ 6. สร้าง Media Categories & Tags ---
  console.log("Seeding Media Taxonomies...");

  const initialCategories = [
    {
      name: { en: "Certificates & Awards", th: "ใบรับรองและรางวัล" },
      slug: "certificate-and-award",
      nameEnNormalized: "certificates & awards",
    },
    {
      name: { en: "Product Shots", th: "รูปถ่ายสินค้า" },
      slug: "product-shots",
      nameEnNormalized: "product shots",
    },
    {
      name: { en: "Testimonials", th: "คำรับรองจากลูกค้า" },
      slug: "testimonials",
      nameEnNormalized: "testimonials",
    },
    {
      name: { en: "Branding & Logos", th: "สื่อแบรนด์และโลโก้" },
      slug: "branding-and-logos",
      nameEnNormalized: "branding & logos",
    },
  ];

  for (const category of initialCategories) {
    await prisma.mediaCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`- Upserted ${initialCategories.length} media categories.`);

  const initialTags = [
    {
      name: { en: "Black Peppercorn", th: "พริกไทยดำ" },
      slug: "black-peppercorn",
      nameEnNormalized: "black peppercorn",
    },
    {
      name: { en: "Red Peppercorn", th: "พริกไทยแดง" },
      slug: "red-peppercorn",
      nameEnNormalized: "red peppercorn",
    },
    {
      name: { en: "Medley Peppercorn", th: "พริกไทยเม็ดหลากสี" },
      slug: "medley-peppercorn",
      nameEnNormalized: "medley peppercorn",
    },
    {
      name: { en: "White Peppercorn", th: "พริกไทยขาว" },
      slug: "white-peppercorn",
      nameEnNormalized: "white peppercorn",
    },
    {
      name: { en: "Adjustable Grinder", th: "ขวดบดปรับระดับได้" },
      slug: "adjustable-grinder",
      nameEnNormalized: "adjustable grinder",
    },
    {
      name: { en: "Vacuum Seal", th: "ถุงซีลสุญญากาศ" },
      slug: "vacuum-seal",
      nameEnNormalized: "vacuum seal",
    },
    {
      name: { en: "Certificate", th: "ใบรับรอง" },
      slug: "certificate",
      nameEnNormalized: "certificate",
    },
    {
      name: { en: "Logo", th: "โลโก้" },
      slug: "logo",
      nameEnNormalized: "logo",
    },
    {
      name: { en: "Testimonial", th: "คำรับรองจากลูกค้า" },
      slug: "testimonial",
      nameEnNormalized: "testimonial",
    },
    {
      name: { en: "Award", th: "รางวัล" },
      slug: "award",
      nameEnNormalized: "award",
    },
    {
      name: { en: "Tau Sar Piah", th: "ขนมเต้าส้อ" },
      slug: "tau-sar-piah",
      nameEnNormalized: "tau sar piah",
    },
    {
      name: { en: "Chinese Pastry Bean Cake", th: "ขนมเปี๊ยะ" },
      slug: "chinese-pastry-bean-cake",
      nameEnNormalized: "chinese pastry bean cake",
    },
    {
      name: { en: "Dessert", th: "ขนมหวาน" },
      slug: "dessert",
      nameEnNormalized: "dessert",
    },
    {
      name: { en: "Pepper Candy", th: "ลูกอมพริกไทย" },
      slug: "pepper-candy",
      nameEnNormalized: "pepper candy",
    },
    {
      name: { en: "Pepper Snack", th: "ขนมพริกไทย" },
      slug: "pepper-snack",
      nameEnNormalized: "pepper snack",
    },
  ];

  for (const tag of initialTags) {
    await prisma.mediaTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log(`- Upserted ${initialTags.length} media tags.`);

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
