import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function exportData() {
  console.log("Fetching data from the database...");

  // 1. ดึงข้อมูล MediaCategory ทั้งหมด
  const categories = await prisma.mediaCategory.findMany({
    select: {
      name: true,
      slug: true,
      nameEnNormalized: true,
    },
  });

  // 2. ดึงข้อมูล MediaTag ทั้งหมด
  const tags = await prisma.mediaTag.findMany({
    select: {
      name: true,
      slug: true,
      nameEnNormalized: true,
    },
  });

  console.log("\n// --- Copy the code below into your prisma/seed.ts file ---");

  // 3. พิมพ์โค้ดสำหรับ Categories ออกมา
  console.log("\n// --- Media Categories ---");
  console.log(
    "const initialCategories =",
    JSON.stringify(categories, null, 2) + ";"
  );

  // 4. พิมพ์โค้ดสำหรับ Tags ออกมา
  console.log("\n// --- Media Tags ---");
  console.log("const initialTags =", JSON.stringify(tags, null, 2) + ";");

  console.log("\n// ----------------------------------------------------");
}

exportData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
