"use client";

import { useTranslations, useLocale } from "next-intl";

import { AuditLogItem } from "@/types/trpc";

import { getLocalizedString } from "@southern-syntax/i18n";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@southern-syntax/ui";

interface AuditLogDetailDialogProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuditLogDetailDialog({
  log,
  isOpen,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  const t = useTranslations("admin_audit_log.dialog_detail");
  const locale = useLocale();

  if (!log) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("action_by")}{" "}
            <strong>
              {getLocalizedString(log.user?.name, locale) ||
                log.user?.email ||
                "System"}
            </strong>{" "}
            {t("on")} <strong>{log.entityType}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted max-h-[60vh] overflow-y-auto rounded-md p-4">
          <h4 className="mb-2 font-semibold">{t("details_title")}</h4>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
