// src/components/admin/roles/RoleManagerClient.tsx
"use client";

import { useTranslations } from "next-intl";
import { useRoleManager } from "@/hooks/useRoleManager";
import { Role } from "@/types/role";
import Spinner from "@/components/common/Spinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import RoleTable from "./RoleTable";
import { Button } from "@southern-syntax/ui";
import { PlusCircle } from "lucide-react";
import RoleFormDialog from "./RoleFormDialog";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useState } from "react";
import AdminPageHeader from "../AdminPageHeader";

export default function RoleManagerClient() {
  const t = useTranslations("admin_rbac");
  const tCommon = useTranslations("common");

  // --- State สำหรับควบคุม Dialog ทั้งหมดจะอยู่ที่นี่ ---
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // --- Hook หลักที่จัดการ Logic ทั้งหมด ---
  const {
    roles,
    permissions,
    isLoading,
    isError,
    error,
    isDeleting,
    // deletingRole,
    // setDeletingRole,
    // handleDeleteRequest,
    handleDeleteConfirm,
  } = useRoleManager();

  const handleAddNew = () => {
    setEditingRole(null);
    // setDialogOpen(true);
    setFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    // setDialogOpen(true);
    setFormOpen(true);
  };

  const actionButton = (
    <Button onClick={handleAddNew}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t("add_role_button")}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorDisplay
        message={error?.message ?? tCommon("errors.unknown_error")}
      />
    );
  }

  return (
    <>
      <AdminPageHeader title={t("title")} actionButton={actionButton} />

      <RoleTable roles={roles} onEdit={handleEdit} onDelete={setDeletingRole} />

      <RoleFormDialog
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        editingRole={editingRole}
        permissions={permissions}
      />

      <ConfirmationDialog
        open={!!deletingRole}
        onOpenChange={() => setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={t("dialog_delete.title")}
        description={t("dialog_delete.description")}
        variant="destructive"
      />
    </>
  );
}
