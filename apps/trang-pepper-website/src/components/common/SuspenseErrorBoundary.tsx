"use client";
import React, { Suspense } from "react";

import Spinner from "./Spinner";
import ErrorBoundary from "./ErrorBoundary";

export default function SuspenseErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
