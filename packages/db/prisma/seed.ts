import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/utils";
import {
  ROLE_NAMES,
  ROLE_DEFINITIONS,
  type RoleDefinition,
  type RoleNameType,
  listAllPermissions,
  getDefaultPermissionsForRole,
} from "@southern-syntax/rbac";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // --- 1. สร้าง Roles ---
  console.log("Seeding Roles...");
  const roleEntries = Object.entries(ROLE_DEFINITIONS) as [
    RoleNameType,
    RoleDefinition,
  ][];

  const rolesToSeed = roleEntries.map(([key, definition]) => ({
    key,
    name: definition.displayName,
    isSystem: definition.isSystem,
    isSelectableOnRegistration: definition.isSelectableOnRegistration ?? false,
  }));
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

  const permissionDescriptors = listAllPermissions();
  const permissionsToCreate: Prisma.PermissionCreateManyInput[] =
    permissionDescriptors.map(({ key, action, resource }) => ({
      key,
      action,
      resource,
      isSystem: true,
    }));
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

  for (const role of roleMap.values()) {
    const permissionKeys = getDefaultPermissionsForRole(role.key as RoleNameType);

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
