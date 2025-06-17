"use client";

import React from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  color="primary"
                  className="w-full"
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Reload Page
                </Button>
                
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  variant="bordered"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;