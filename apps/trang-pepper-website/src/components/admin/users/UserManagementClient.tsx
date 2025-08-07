"use client";

import { useState } from "react";
import { PlusCircle, Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import type { UserItem } from "@/types/user";

import { getLocalizedString } from "@southern-syntax/i18n";

// Hooks
import { useUserManagement } from "@/hooks/useUserManagement";

// UI Components
import { Button, Input } from "@southern-syntax/ui";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

import UserTable from "./UserTable";
import AddUserDialog from "./AddUserDialog";
import EditUserDialog from "./EditUserDialog";
import UserStatusTabs from "./UserStatusTabs";
import UserRoleFilter from "./UserRoleFilter";
import UserActionBar from "./_components/UserActionBar";

export default function UserManagementClient() {
  // --- Translation ----
  const t = useTranslations("admin_users");
  const t_common = useTranslations("common");
  const t_empty = useTranslations("common.empty_states");

  // --- State Management for Dialogs ---
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserItem | null>(
    null
  );
  const [isBulkDeactivateConfirmOpen, setBulkDeactivateConfirmOpen] =
    useState(false);
  const [isBulkReactivateConfirmOpen, setBulkReactivateConfirmOpen] =
    useState(false);

  // --- The One Hook to Rule Them All ---
  const {
    users,
    status,
    roleId,
    totalCount,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    inputValue,
    setInputValue,
    searchInputRef,
    selectedIds,
    toggleSelection,
    clearSelection,
    handleDeactivateSelected,
    handleReactivateSelected,
    handleChangeRoleSelected,
    handleStatusChange,
    sortBy,
    sortOrder,
    handleSort,
    isDeactivatingMany,
    isReactivatingMany,
    isChangingRoleMany,
    isUpdatingUser,
    currentUserId,
    areAllSelected,
    handleToggleSelectAll,
    handleActivateUser,
    handleDeactivateSingle,
    canReactivate,
    canDeactivate,
  } = useUserManagement();

  // --- Handlers for Dialogs ---
  const handleDeactivateSingleConfirm = () => {
    if (deactivatingUser) {
      handleDeactivateSingle(deactivatingUser);
      setDeactivatingUser(null);
    }
  };

  const handleBulkDeactivateConfirm = () => {
    handleDeactivateSelected();
    setBulkDeactivateConfirmOpen(false);
  };

  const handleBulkReactivateConfirm = () => {
    handleReactivateSelected();
    setBulkReactivateConfirmOpen(false);
  };

  const addUserButton = (
    <Button onClick={() => setAddUserDialogOpen(true)}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t("add_user_button")}
    </Button>
  );

  const searchAndFilters = (
    <div className="flex items-center gap-2">
      <UserStatusTabs
        currentStatus={status}
        onStatusChange={handleStatusChange}
      />
      <UserRoleFilter currentRoleId={roleId} />
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={searchInputRef}
          placeholder={t("search_placeholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-10 md:w-[200px] lg:w-[300px]"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <Spinner className="mx-auto mt-8 h-8 w-8" />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        message={
          error instanceof Error
            ? error.message
            : t_common("errors.unknown_error")
        }
      />
    );
  }

  const isFiltering = !!(inputValue || status !== "all" || roleId);

  return (
    <>
      <AdminPageHeader title={t("title")} actionButton={addUserButton} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {searchAndFilters}
        </div>

        {selectedIds.size > 0 && (
          <UserActionBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onDeactivateSelected={() => setBulkDeactivateConfirmOpen(true)}
            onReactivateSelected={() => setBulkReactivateConfirmOpen(true)}
            onChangeRoleSelected={handleChangeRoleSelected}
            isDeactivating={isDeactivatingMany}
            isReactivating={isReactivatingMany}
            isChangingRole={isChangingRoleMany}
            canDeactivate={canDeactivate}
            canReactivate={canReactivate}
          />
        )}

        {users.length > 0 ? (
          <>
            <UserTable
              users={users}
              selectedIds={selectedIds}
              currentUserId={currentUserId}
              areAllSelectableSelected={areAllSelected}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectRow={toggleSelection}
              onEditUser={setEditingUser}
              onDeleteUser={setDeactivatingUser}
              onActivateUser={handleActivateUser}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </>
        ) : (
          <EmptyState
            Icon={Users}
            title={
              isFiltering
                ? t_empty("users.filtered.title")
                : t_empty("users.initial.title")
            }
            description={
              isFiltering
                ? t_empty("users.filtered.description")
                : t_empty("users.initial.description")
            }
            // แสดงปุ่ม Add User ใน Empty State เมื่อไม่ได้ฟิลเตอร์อยู่
            actionButton={!isFiltering ? addUserButton : undefined}
          />
        )}

        <AddUserDialog
          isOpen={isAddUserDialogOpen}
          onOpenChange={setAddUserDialogOpen}
        />
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
        />

        <ConfirmationDialog
          open={!!deactivatingUser}
          onOpenChange={() => setDeactivatingUser(null)}
          onConfirm={handleDeactivateSingleConfirm}
          isLoading={isUpdatingUser}
          title={t("dialog_delete.title")}
          description={
            <>
              {t("dialog_delete.description")}{" "}
              <span className="font-bold text-red-600">
                {deactivatingUser
                  ? getLocalizedString(deactivatingUser.name, "en") ||
                    deactivatingUser.email
                  : ""}
              </span>
              ?
            </>
          }
          variant="destructive"
        />

        <ConfirmationDialog
          open={isBulkDeactivateConfirmOpen}
          onOpenChange={setBulkDeactivateConfirmOpen}
          onConfirm={handleBulkDeactivateConfirm}
          isLoading={isDeactivatingMany}
          title={t("action_bar.deactivate_dialog.title")}
          description={t("action_bar.deactivate_dialog.description", {
            count: selectedIds.size,
          })}
          variant="destructive"
        />

        <ConfirmationDialog
          open={isBulkReactivateConfirmOpen}
          onOpenChange={setBulkReactivateConfirmOpen}
          onConfirm={handleBulkReactivateConfirm}
          isLoading={isReactivatingMany}
          title={t("action_bar.reactivate_dialog.title")}
          description={t("action_bar.reactivate_dialog.description", {
            count: selectedIds.size,
          })}
          variant="default"
        />
      </div>
    </>
  );
}
