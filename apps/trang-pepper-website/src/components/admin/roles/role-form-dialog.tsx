"use client";
import {
  PERMISSION_RESOURCES,
  ROLE_NAMES,
  type PermissionResourceType,
  getActionsForResource,
  getPermissionResourceDefinition,
  sortPermissionActions,
  isSuperAdminOnlyResource,
} from "@southern-syntax/rbac";

import { useTranslations } from "next-intl";
import { FormProvider, Controller } from "react-hook-form";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { useRoleForm } from "@/hooks/use-role-form";
import type { Role, Permission } from "@southern-syntax/types";

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

import FormFieldError from "@/components/common/form-field-error";

interface RoleFormDialogProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  editingRole: Role | null;
  permissions: Permission[];
}

export default function RoleFormDialog({
  isOpen,
  onOpenChangeAction,
  editingRole,
  permissions,
}: RoleFormDialogProps) {
  const t = useTranslations("admin_rbac");
  const t_common = useTranslations("common");
  const { data: session } = useSession();

  const { formMethods, onSubmit, isLoading } = useRoleForm({
    editingRole,
    onSuccessAction: () => onOpenChangeAction(false), // เมื่อสำเร็จ ให้ปิด Dialog
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;

  const resourceOrder = Object.values(
    PERMISSION_RESOURCES
  ) as PermissionResourceType[];

  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      const resource = permission.resource as PermissionResourceType;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource]?.push(permission);
      return acc;
    },
    {} as Record<PermissionResourceType, Permission[]>
  );

  const resourceSections = resourceOrder
    .map((resource) => {
      const resourceDefinition = getPermissionResourceDefinition(resource);
      const allowedActions = sortPermissionActions(
        getActionsForResource(resource)
      );
      const availablePermissions = permissionsByResource[resource] ?? [];

      const sortedPermissions = allowedActions
        .map((action) =>
          availablePermissions.find((permission) => permission.action === action)
        )
        .filter((permission): permission is Permission => Boolean(permission));

      if (sortedPermissions.length === 0) {
        return null;
      }

      return {
        resource,
        definition: resourceDefinition,
        permissions: sortedPermissions,
      };
    })
    .filter(
      (
        section
      ): section is {
        resource: PermissionResourceType;
        definition: ReturnType<typeof getPermissionResourceDefinition>;
        permissions: Permission[];
      } =>
        Boolean(section)
    );

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
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
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
                        {resourceSections.map(
                          ({ resource, definition, permissions: resourcePermissions }) => {
                            const fallbackLabel = resource
                              .toLowerCase()
                              .replace(/_/g, " ");
                            const resourceLabel = definition.labelKey
                              ? t_common(definition.labelKey)
                              : fallbackLabel;
                            const resourceDescription = definition.descriptionKey
                              ? t_common(definition.descriptionKey)
                              : undefined;
                            const resourceIsSuperAdminOnly =
                              isSuperAdminOnlyResource(resource);

                            return (
                              <div key={resource} className="rounded-md border p-4">
                                <h4 className="mb-1 font-semibold capitalize">
                                  {resourceLabel}
                                </h4>
                                {resourceDescription && (
                                  <p className="mb-3 text-sm text-muted-foreground">
                                    {resourceDescription}
                                  </p>
                                )}
                              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {resourcePermissions.map((perm) => {
                                  const checked = field.value?.includes(perm.id);
                                  const disableCheckbox =
                                    !currentUserIsSuperAdmin &&
                                    resourceIsSuperAdminOnly;

                                  return (
                                    <div
                                      key={perm.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={perm.id}
                                        checked={checked}
                                        disabled={disableCheckbox}
                                        onCheckedChange={(isChecked) => {
                                          const newValue = isChecked
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
                                          "text-sm capitalize",
                                          !checked && "text-muted-foreground"
                                        )}
                                      >
                                        {perm.action
                                          .toLowerCase()
                                          .replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                  <FormFieldError error={errors.permissionIds} />
                </div>
              </fieldset>
            </ScrollArea>

            <DialogFooter className="mt-4 border-t pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChangeAction(false)}
                >
                  {t("dialog_shared.cancel")}
                </Button>
              </DialogClose>

              {/*  ซ่อนปุ่ม Save ถ้ากำลังแก้ Super Admin  */}
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
