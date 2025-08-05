'use client';

import React from 'react';

import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <ErrorBoundary>
      <div className="p-4 text-center">
        <h2 className="mb-4 text-xl text-red-600">Something went wrong.</h2>
        <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </ErrorBoundary>
  );
}
