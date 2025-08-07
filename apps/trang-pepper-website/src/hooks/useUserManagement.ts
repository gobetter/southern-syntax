"use client";

import {
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  useRef,
  RefObject,
} from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  type UserStatusFilter,
  type UserStatusView,
  type UserSortableField,
  VALID_USER_STATUSES,
} from "@southern-syntax/types";
import { useUpdateQuery, useDebounce, useToast } from "@southern-syntax/hooks";

import { trpc } from "@/lib/trpc-client";
import type { UserItem } from "@/types/user";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import type { SortOrder } from "@/constants/common";
import { useSelectionSet } from "@/components/admin/media/MediaGrid/useSelectionSet";

import { useUpdateUser } from "./useUpdateUser";

interface UseUserManagementReturn {
  // Data and State
  users: UserItem[];
  currentUserId?: string;
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
  status: UserStatusView;
  roleId: string | undefined;
  sortBy: UserSortableField | null;
  sortOrder: SortOrder | null;

  // Search State
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  searchInputRef: RefObject<HTMLInputElement | null>;

  // Selection State & Handlers
  selectedIds: Set<string>;
  canReactivate: boolean;
  canDeactivate: boolean;
  isDeactivatingMany: boolean;
  isReactivatingMany: boolean;
  isChangingRoleMany: boolean;
  areAllSelected: boolean;
  handleDeactivateSelected: () => void;
  handleReactivateSelected: () => void;
  handleChangeRoleSelected: (roleId: string) => void;
  handleToggleSelectAll: () => void;
  toggleSelection: (id: string, selected: boolean) => void;
  clearSelection: () => void;

  // Single Item Action State & Handlers
  isUpdatingUser: boolean;
  handleActivateUser: (user: UserItem) => void;
  handleDeactivateSingle: (user: UserItem) => void;

  // Filter and Sort Handlers
  handleSort: (field: UserSortableField) => void;
  handleStatusChange: (status: string) => void;
}

// Type Guard
function isValidStatusFilter(
  status: string | null
): status is UserStatusFilter {
  return (
    !!status && (VALID_USER_STATUSES as readonly string[]).includes(status)
  );
}

export function useUserManagement(): UseUserManagementReturn {
  // --- Core Hooks ---
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const searchParams = useSearchParams();
  const updateQuery = useUpdateQuery();
  const utils = trpc.useUtils();
  const toast = useToast();
  const t_toasts = useTranslations("admin_users.toasts");

  // --- Selection Logic ---
  const { selectedIds, toggleSelection, clearSelection } = useSelectionSet();

  // --- URL State ---
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const searchQuery = searchParams.get("q") || "";
  const roleId = searchParams.get("roleId") || undefined;
  const statusFromUrl = searchParams.get("status");
  const statusForQuery = isValidStatusFilter(statusFromUrl)
    ? statusFromUrl
    : undefined;
  const sortBy = searchParams.get("sortBy") as UserSortableField | null;
  const sortOrder = searchParams.get("sortOrder") as SortOrder | null;

  // --- Local State ---
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, 500);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userQuery = trpc.user.getAll.useQuery({
    page,
    pageSize,
    searchQuery: debouncedSearchQuery,
    status: statusForQuery,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
    roleId,
  });

  const { data: result, isLoading, isError, error } = userQuery;
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser();
  const deactivateManyMutation = trpc.user.deactivateMany.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("deactivate_many_success"));
      utils.user.getAll.invalidate();
      clearSelection();
    },
    onError: (e: TRPCClientErrorLike<AppRouter>) =>
      toast.error(t_toasts("deactivate_many_error", { error: e.message })),
  });
  const reactivateManyMutation = trpc.user.reactivateMany.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("reactivate_many_success"));
      utils.user.getAll.invalidate();
      clearSelection();
    },
    onError: (e: TRPCClientErrorLike<AppRouter>) =>
      toast.error(t_toasts("reactivate_many_error", { error: e.message })),
  });
  const changeRoleManyMutation = trpc.user.changeRoleMany.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("change_role_many_success"));
      utils.user.getAll.invalidate();
      clearSelection();
    },
    onError: (e: TRPCClientErrorLike<AppRouter>) =>
      toast.error(t_toasts("change_role_many_error", { error: e.message })),
  });

  // --- Derived State (Memoized) ---
  const users: UserItem[] = useMemo(
    () => (result?.data as unknown as UserItem[]) ?? [],
    [result]
  );
  const totalCount = result?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const selectedItems = useMemo(
    () => users.filter((user) => selectedIds.has(user.id)),
    [users, selectedIds]
  );
  const canReactivate = useMemo(
    () => selectedItems.some((user) => !user.isActive),
    [selectedItems]
  );
  const canDeactivate = useMemo(
    () => selectedItems.some((user) => user.isActive),
    [selectedItems]
  );

  const selectableUsers = useMemo(
    () => users.filter((u) => u.id !== currentUserId),
    [users, currentUserId]
  );

  const areAllSelected = useMemo(
    () =>
      selectableUsers.length > 0 &&
      selectableUsers.every((user) => selectedIds.has(user.id)),
    [selectableUsers, selectedIds]
  );

  // --- Handlers ---
  const handleSort = (field: UserSortableField) => {
    const newSortOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    updateQuery({ sortBy: field, sortOrder: newSortOrder, page: 1 });
  };
  const handleStatusChange = (status: string) => {
    clearSelection();
    updateQuery({ status: status === "all" ? null : status, page: 1 });
  };
  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      clearSelection();
    } else {
      selectableUsers.forEach((user) => toggleSelection(user.id, true));
    }
  };
  const handleDeactivateSelected = () => {
    deactivateManyMutation.mutate({ ids: Array.from(selectedIds) });
  };
  const handleReactivateSelected = () => {
    reactivateManyMutation.mutate({ ids: Array.from(selectedIds) });
  };
  const handleChangeRoleSelected = (roleId: string) => {
    if (!roleId) return;
    changeRoleManyMutation.mutate({ ids: Array.from(selectedIds), roleId });
  };
  const handleActivateUser = (user: UserItem) => {
    updateUser({ id: user.id, data: { isActive: true } });
  };
  const handleDeactivateSingle = (user: UserItem) => {
    updateUser({ id: user.id, data: { isActive: false } });
  };

  // --- Effects ---
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      updateQuery({ q: debouncedSearchQuery || null, page: 1 });
    }
  }, [debouncedSearchQuery, searchQuery, updateQuery]);

  useEffect(() => {
    if (!isLoading && debouncedSearchQuery && searchInputRef.current) {
      const input = searchInputRef.current;
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [isLoading, debouncedSearchQuery]);

  useEffect(() => {
    if (!isLoading && page > totalPages && totalPages > 0) {
      updateQuery({ page: totalPages });
    }
  }, [isLoading, page, totalPages, updateQuery]);

  useEffect(() => {
    // ทุกครั้งที่ page, pageSize, หรือฟิลเตอร์อื่นๆ (search, status, role, sort) เปลี่ยนแปลง
    // ให้ทำการล้างการเลือกทั้งหมด
    // `clearSelection` ถูกห่อหุ้มด้วย useCallback ใน `useSelectionSet` แล้ว จึงมีความเสถียร
    clearSelection();
  }, [
    page,
    pageSize,
    debouncedSearchQuery,
    statusForQuery,
    roleId,
    sortBy,
    sortOrder,
    clearSelection,
  ]);

  return {
    users,
    totalCount,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    status: statusForQuery ?? "all",
    roleId,
    sortBy,
    sortOrder,
    inputValue,
    setInputValue,
    searchInputRef,
    selectedIds,
    toggleSelection,
    clearSelection,
    canDeactivate,
    canReactivate,
    handleDeactivateSelected,
    handleReactivateSelected,
    handleChangeRoleSelected,
    handleStatusChange,
    handleSort,
    handleToggleSelectAll,
    handleActivateUser,
    handleDeactivateSingle,
    isDeactivatingMany: deactivateManyMutation.isPending,
    isReactivatingMany: reactivateManyMutation.isPending,
    isChangingRoleMany: changeRoleManyMutation.isPending,
    isUpdatingUser,
    currentUserId,
    areAllSelected,
  };
}
