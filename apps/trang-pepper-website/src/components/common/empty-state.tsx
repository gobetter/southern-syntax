import React from "react";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export default function EmptyState({
  Icon,
  title,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
        <Icon className="text-primary h-10 w-10" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        {description}
      </p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
}
