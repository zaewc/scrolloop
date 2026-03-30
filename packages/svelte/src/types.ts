import type { Snippet } from "svelte";

export interface ItemStyle {
  position: "absolute";
  top: string;
  height: string;
  width: string;
}

export interface VirtualListProps<T = unknown> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  children: Snippet<[index: number, item: T, style: ItemStyle]>;
}

export interface InfiniteListProps<T> {
  fetchPage: (
    page: number,
    size: number
  ) => Promise<{ items: T[]; total: number }>;
  pageSize?: number;
  initialPage?: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  children: Snippet<[index: number, item: T | undefined, style: ItemStyle]>;
  error?: Snippet<[error: Error, retry: () => void]>;
  loading?: Snippet;
  empty?: Snippet;
}
