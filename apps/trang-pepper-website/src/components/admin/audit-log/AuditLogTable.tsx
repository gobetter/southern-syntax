"use client";

import { useTranslations, useLocale } from "next-intl";
import { getLocalizedString } from "@southern-syntax/i18n";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@southern-syntax/ui";

// import type { MediaItem } from "@southern-syntax/types";
import type { AuditLogItem } from "@/types/trpc";

interface AuditLogTableProps {
  logs: AuditLogItem[];
  onViewDetailsAction: (log: AuditLogItem) => void;
}

export default function AuditLogTable({
  logs,
  onViewDetailsAction,
}: AuditLogTableProps) {
  const t = useTranslations("admin_audit_log.table");
  const locale = useLocale();

  const formatDate = (dateString: string | Date) => {
    // สร้าง Date object จาก string ที่ได้รับมา
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[25%]">{t("header_action")}</TableHead>
            <TableHead className="w-[25%]">{t("header_user")}</TableHead>
            <TableHead className="w-[30%]">{t("header_entity")}</TableHead>
            <TableHead className="w-[20%] text-right">
              {t("header_timestamp")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow
              key={log.id}
              onClick={() => onViewDetailsAction(log)}
              className="hover:bg-muted/50 cursor-pointer"
            >
              <TableCell>
                <Badge variant="outline">{log.action}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getLocalizedString(log.user?.name, locale) ||
                      log.user?.email ||
                      "System"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {log.user?.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{log.entityType}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {log.entityId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-sm">
                {formatDate(log.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
