'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    console.error('Error stack:', error.stack);
    
    // Log to console with full context
    const errorDetails = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    };
    console.error('📋 Full error context:', JSON.stringify(errorDetails, null, 2));
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="flex min-h-screen items-center justify-center bg-blue-100 p-4">
          <div className="max-w-md rounded-lg bg-red-50 p-6 text-red-800 shadow-md">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="mt-2 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 overflow-auto max-h-40 bg-red-100 p-2 rounded">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

