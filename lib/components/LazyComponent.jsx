import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export function withLazyLoading(importFunc, fallback = <LoadingSpinner />) {
  const LazyComponent = lazy(importFunc);
  
  return function WrappedComponent(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}