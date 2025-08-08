"use client";

import { useTranslations } from "next-intl";

import { cn } from "@southern-syntax/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@southern-syntax/ui";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirmAction: () => void;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

export default function ConfirmationDialog({
  open,
  onOpenChangeAction,
  title,
  description,
  onConfirmAction,
  isLoading = false,
  variant = "default",
}: ConfirmationDialogProps) {
  const t = useTranslations("common.confirmation_dialog");

  const actionClasses = cn({
    "bg-destructive text-destructive-foreground hover:bg-destructive/90":
      variant === "destructive",
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmAction}
            disabled={isLoading}
            className={actionClasses}
          >
            {isLoading ? t("processing") : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
