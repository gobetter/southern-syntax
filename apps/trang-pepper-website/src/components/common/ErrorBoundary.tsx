"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

import { ErrorFallbackUI } from "./ErrorFallbackUI";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // ถ้ามี props.fallback ก็ใช้ตัวนั้น แต่ถ้าไม่มี ให้ใช้ ErrorFallbackUI ของเรา
      return this.props.fallback || <ErrorFallbackUI />;
    }

    return this.props.children;
  }
}
