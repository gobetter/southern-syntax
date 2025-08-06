// src/components/admin/roles/RoleFormDialog.tsx
"use client";

import { useTranslations } from "next-intl";
import { FormProvider, Controller } from "react-hook-form";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

import { useRoleForm } from "@/hooks/useRoleForm";
import { type Role, type Permission } from "@/hooks/useRoleManager";
import { PERMISSION_RESOURCES, ROLE_NAMES } from "@southern-syntax/auth";

import FormFieldError from "@/components/common/FormFieldError";
import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  ScrollArea,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@southern-syntax/ui";
import { cn } from "@southern-syntax/ui";

interface RoleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  permissions: Permission[];
}

export default function RoleFormDialog({
  isOpen,
  onOpenChange,
  editingRole,
  permissions,
}: RoleFormDialogProps) {
  const t = useTranslations("admin_rbac");
  const t_common = useTranslations("common");
  const { data: session } = useSession();

  const { formMethods, onSubmit, isLoading } = useRoleForm({
    editingRole,
    onSuccess: () => onOpenChange(false), // เมื่อสำเร็จ ให้ปิด Dialog
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;

  // จัดกลุ่ม Permissions ตาม Resource เพื่อให้แสดงผลง่ายขึ้น
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      (acc[permission.action] = acc[permission.action] || []).push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  // (Optional) จัดลำดับกลุ่มเพื่อให้ CRUD อยู่ก่อน
  const actionOrder = ["CREATE", "READ", "UPDATE", "DELETE"];
  const sortedGroupedPermissions = Object.entries(groupedPermissions).sort(
    ([a], [b]) => actionOrder.indexOf(a) - actionOrder.indexOf(b)
  );

  // สร้าง Array ของ Resource ที่สงวนไว้สำหรับ Super Admin
  const SUPERADMIN_ONLY_RESOURCES: string[] = [
    PERMISSION_RESOURCES.ROLE,
    PERMISSION_RESOURCES.AUDIT_LOG,
    // เพิ่ม Resource อื่นๆ ที่ต้องการสงวนไว้ในอนาคตที่นี่
  ];

  // const isEditingSuperAdminRole = editingRole?.key === ROLE_NAMES.SUPERADMIN;
  const isEditingSuperAdmin = editingRole?.key === ROLE_NAMES.SUPERADMIN;
  const isSystemRole = editingRole?.isSystem ?? false;
  const currentUserIsSuperAdmin = session?.user?.role === ROLE_NAMES.SUPERADMIN;

  // ฟอร์มจะถูก disable ก็ต่อเมื่อ:
  // 1. กำลังแก้ไข Super Admin Role, หรือ
  // 2. กำลังแก้ไข System Role อื่นๆ และผู้ใช้ไม่ใช่ Super Admin
  const isFormDisabled =
    isEditingSuperAdmin || (isSystemRole && !currentUserIsSuperAdmin);

  const shouldShowSystemRoleAlert =
    isSystemRole && !isEditingSuperAdmin && !currentUserIsSuperAdmin;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            {editingRole ? t("dialog_edit.title") : t("dialog_add.title")}
          </DialogTitle>
          <DialogDescription>
            {editingRole
              ? t("dialog_edit.description")
              : t("dialog_add.description")}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-6">
              {/* เพิ่ม Alert สำหรับ Super Admin */}
              {isEditingSuperAdmin && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("dialog_edit.super_admin_alert")}
                  </AlertDescription>
                </Alert>
              )}

              {shouldShowSystemRoleAlert && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("dialog_edit.system_role_alert")}
                  </AlertDescription>
                </Alert>
              )}

              <fieldset disabled={isFormDisabled} className="space-y-4">
                {/* Key Field */}
                <div>
                  <Label htmlFor="key">{t("form.key_label")}</Label>
                  <Input
                    id="key"
                    {...register("key")}
                    disabled={!!editingRole}
                  />
                  <FormFieldError error={errors.key} />
                </div>

                {/* Name Fields */}
                <div>
                  <Label htmlFor="name_en">{t("form.name_en_label")}</Label>
                  <Input id="name_en" {...register("name.en")} />
                  <FormFieldError error={errors.name?.en} />
                </div>
                <div>
                  <Label htmlFor="name_th">{t("form.name_th_label")}</Label>
                  <Input id="name_th" {...register("name.th")} />
                  <FormFieldError error={errors.name?.th} />
                </div>

                {/* Description Field */}
                <div>
                  <Label htmlFor="description">
                    {t("form.description_label")}
                  </Label>
                  <Textarea id="description" {...register("description")} />
                  <FormFieldError error={errors.description} />
                </div>

                {/* Permissions Checkboxes */}
                <div>
                  <Label>{t("form.permissions_label")}</Label>
                  <Controller
                    name="permissionIds"
                    control={control}
                    render={({ field }) => (
                      <div className="mt-2 space-y-4">
                        {/* ใช้ Array ที่จัดลำดับแล้ว */}
                        {sortedGroupedPermissions.map(([action, perms]) => (
                          <div key={action} className="rounded-md border p-4">
                            <h4 className="mb-2 font-semibold capitalize">
                              {action.toLowerCase()}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {perms.map((perm) => (
                                <div
                                  key={perm.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={perm.id}
                                    // ถ้ากำลังแก้ Super Admin ให้ติ๊กถูกและ disable เสมอ
                                    // checked={
                                    //   isEditingSuperAdmin ? true : field.value?.includes(perm.id)
                                    // }
                                    checked={field.value?.includes(perm.id)}
                                    // disabled={isEditingSuperAdmin}
                                    disabled={SUPERADMIN_ONLY_RESOURCES.includes(
                                      perm.resource
                                    )}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), perm.id]
                                        : (field.value || []).filter(
                                            (id) => id !== perm.id
                                          );
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <Label
                                    htmlFor={perm.id}
                                    className={cn(
                                      "font-normal capitalize",
                                      // (Optional) ทำให้ Label เป็นสีเทาด้วย
                                      SUPERADMIN_ONLY_RESOURCES.includes(
                                        perm.resource
                                      ) &&
                                        "text-muted-foreground cursor-not-allowed"
                                    )}
                                  >
                                    {perm.resource
                                      .toLowerCase()
                                      .replace(/_/g, " ")}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </fieldset>
            </ScrollArea>

            <DialogFooter className="mt-4 border-t pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  {t("dialog_shared.cancel")}
                </Button>
              </DialogClose>

              {/*  ซ่อนปุ่ม Save ถ้ากำลังแก้ Super Admin  */}
              {/* {!isFormDisabled && !isEditingSuperAdmin && ( */}
              {!isFormDisabled && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? t_common("general.loading")
                    : t("dialog_shared.save")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
