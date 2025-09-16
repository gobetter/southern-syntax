import { prisma } from "@southern-syntax/db";

async function getAllPermissions() {
  return prisma.permission.findMany({
    orderBy: {
      resource: "asc", // จัดกลุ่มตาม resource
    },
  });
}

export const permissionService = {
  getAllPermissions,
};
