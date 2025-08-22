"use client";
import React, { Suspense } from "react";

import Spinner from "./spinner";
import ErrorBoundary from "./error-boundary";

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
