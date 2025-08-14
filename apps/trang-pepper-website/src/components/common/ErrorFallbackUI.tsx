"use client";

type Props = {
  title?: string;
  message?: string;
};

export function ErrorFallbackUI({
  title = "An error occurred",
  message = "Something went wrong",
}: Props) {
  return (
    <div className="border-destructive/50 bg-destructive/10 flex h-full min-h-48 w-full items-center justify-center rounded-md border border-dashed p-4">
      <div className="text-destructive text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
