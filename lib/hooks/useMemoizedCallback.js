import { useCallback, useRef } from 'react';

export function useMemoizedCallback(callback, deps) {
  const ref = useRef();
  
  return useCallback((...args) => {
    if (!ref.current || deps.some((dep, i) => dep !== ref.current.deps[i])) {
      ref.current = {
        callback: callback(...args),
        deps: [...deps]
      };
    }
    return ref.current.callback;
  }, deps);
}