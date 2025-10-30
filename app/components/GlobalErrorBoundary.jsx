'use client';

import { Component } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardBody className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-gray-600">We're sorry, but something unexpected happened.</p>
              <Button
                color="primary"
                onClick={() => window.location.reload()}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Reload Page
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;