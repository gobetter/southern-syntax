import { router, authorizedProcedure, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@southern-syntax/trpc";
import { permissionService } from "@southern-syntax/domain-admin/permission";

export const permissionRouter = router({
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.ROLE, // คนที่มีสิทธิ์จัดการ Role ควรจะเห็น Permission ทั้งหมด
    PERMISSION_ACTIONS.READ
  ).query(async () => {
    return permissionService.getAllPermissions();
  }),
});
