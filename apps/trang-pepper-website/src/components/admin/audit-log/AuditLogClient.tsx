"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { useSearchParams } from "next/navigation";

// import type { AuditLogItem } from "@southern-syntax/types";
import { AuditLogItem } from "@/types/trpc";

import Spinner from "@/components/common/Spinner";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { DataTablePagination } from "@/components/common/DataTablePagination";

import AuditLogTable from "./AuditLogTable";
import AuditLogDetailDialog from "./AuditLogDetailDialog";

export default function AuditLogClient() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 25;

  const [viewingLog, setViewingLog] = useState<AuditLogItem | null>(null);

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = trpc.auditLog.getAll.useQuery({
    page,
    pageSize,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return <ErrorDisplay message={error.message} />;
  }

  // Cast the returned data to the simplified interface
  const logs = (result?.data ?? []) as unknown as AuditLogItem[];
  const totalCount = result?.totalCount ?? 0;

  return (
    <div className="space-y-4">
      <AuditLogTable logs={logs} onViewDetailsAction={setViewingLog} />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

      <AuditLogDetailDialog
        log={viewingLog}
        isOpen={!!viewingLog}
        onOpenChangeAction={() => setViewingLog(null)}
      />
    </div>
  );
}
