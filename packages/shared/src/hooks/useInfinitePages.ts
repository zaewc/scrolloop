import { useState, useCallback, useEffect, useRef } from "react";
import { InfiniteSource } from "../InfiniteSource";
import type {
  InfiniteSourceState,
  InfiniteSourceOptions,
} from "../InfiniteSource";

export function useInfinitePages<T>(
  options: InfiniteSourceOptions<T>
): InfiniteSourceState<T> & {
  loadPage: (page: number) => Promise<void>;
  retry: () => void;
  reset: () => void;
} {
  const { fetchPage, pageSize, initialPage, onPageLoad, onError } = options;

  const managerRef = useRef<InfiniteSource<T>>(null);
  if (!managerRef.current) {
    (managerRef as React.MutableRefObject<InfiniteSource<T>>).current =
      new InfiniteSource({
        fetchPage,
        pageSize,
        initialPage,
        onPageLoad,
        onError,
      });
  }

  const [state, setState] = useState<InfiniteSourceState<T>>(() =>
    managerRef.current!.getState()
  );

  useEffect(() => {
    const manager = managerRef.current!;
    const unsubscribe = manager.subscribe(setState);
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, []);

  useEffect(() => {
    managerRef.current!.updateCallbacks({ fetchPage, onPageLoad, onError });
  }, [fetchPage, onPageLoad, onError]);

  const loadPage = useCallback(
    (page: number) => managerRef.current!.loadPage(page),
    []
  );
  const retry = useCallback(() => managerRef.current!.retry(), []);
  const reset = useCallback(() => managerRef.current!.reset(), []);

  return { ...state, loadPage, retry, reset };
}
