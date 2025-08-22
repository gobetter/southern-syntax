"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";

import { Button } from "@southern-syntax/ui";

import { useRoleManager } from "@/hooks/use-role-manager";
import type { Role } from "@southern-syntax/types";

import Spinner from "@/components/common/spinner";
import ErrorDisplay from "@/components/common/error-display";
import ConfirmationDialog from "@/components/common/confirmation-dialog";

import AdminPageHeader from "../admin-page-header";

import RoleFormDialog from "./role-form-dialog";
import RoleTable from "./role-table";

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
    handleDeleteConfirm,
  } = useRoleManager();

  const handleAddNew = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
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

      <RoleTable
        roles={roles}
        onEditAction={handleEdit}
        onDeleteAction={setDeletingRole}
      />

      <RoleFormDialog
        isOpen={isFormOpen}
        onOpenChangeAction={setFormOpen}
        editingRole={editingRole}
        permissions={permissions}
      />

      <ConfirmationDialog
        open={!!deletingRole}
        onOpenChangeAction={() => setDeletingRole(null)}
        onConfirmAction={handleDeleteConfirm}
        isLoading={isDeleting}
        title={t("dialog_delete.title")}
        description={t("dialog_delete.description")}
        variant="destructive"
      />
    </>
  );
}
