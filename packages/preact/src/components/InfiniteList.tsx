import { useEffect, useCallback, useMemo } from "preact/hooks";
import type { CSSProperties } from "preact";
import type { InfiniteListProps } from "../types";
import { VirtualList } from "./VirtualList";
import { useInfinitePages } from "../hooks/useInfinitePages";

export function InfiniteList<T>({
  fetchPage,
  renderItem,
  itemSize,
  pageSize = 20,
  initialPage = 0,
  height = 400,
  overscan: userOverscan,
  class: className,
  style,
  renderLoading,
  renderError,
  renderEmpty,
  onPageLoad,
  onError,
}: InfiniteListProps<T>) {
  const overscan = useMemo(
    () => userOverscan ?? Math.max(20, pageSize * 2),
    [userOverscan, pageSize]
  );

  const { pages, total, loadingPages, hasMore, error, loadPage, retry } =
    useInfinitePages({ fetchPage, pageSize, initialPage, onPageLoad, onError });

  useEffect(() => {
    if (total === 0 && !error) {
      const needed = Math.ceil(height / itemSize) + overscan * 2;
      const pagesToLoad = Math.ceil(needed / pageSize);
      for (let p = 0; p < pagesToLoad; p++) loadPage(p);
    }
  }, [total, error, height, itemSize, pageSize, overscan, loadPage]);

  const handleRangeChange = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      const ps = (range.startIndex / pageSize) | 0;
      const pe = ((range.endIndex / pageSize) | 0) + 1;
      for (let p = ps; p <= pe; p++) loadPage(p);
    },
    [pageSize, loadPage]
  );

  const virtualRenderItem = useCallback(
    (index: number, itemStyle: CSSProperties) =>
      renderItem(
        pages.get(Math.floor(index / pageSize))?.[index % pageSize],
        index,
        itemStyle
      ),
    [pages, pageSize, renderItem]
  );

  const centerStyle: CSSProperties = {
    height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (error && total === 0) {
    if (renderError)
      return <div style={{ height }}>{renderError(error, retry)}</div>;
    return (
      <div style={centerStyle}>
        <div style={{ textAlign: "center" }}>
          <p>Error.</p>
          <p style={{ color: "#666", fontSize: "0.9em" }}>{error.message}</p>
          <button
            onClick={retry}
            style={{ marginTop: 8, padding: "4px 12px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (total === 0 && loadingPages.size > 0) {
    if (renderLoading) return <div style={{ height }}>{renderLoading()}</div>;
    return (
      <div style={centerStyle}>
        <p>Loading...</p>
      </div>
    );
  }

  if (total === 0 && !hasMore) {
    if (renderEmpty) return <div style={{ height }}>{renderEmpty()}</div>;
    return (
      <div style={centerStyle}>
        <p>No data.</p>
      </div>
    );
  }

  return (
    <VirtualList
      count={total}
      itemSize={itemSize}
      height={height}
      overscan={overscan}
      class={className}
      style={style}
      onRangeChange={handleRangeChange}
      renderItem={virtualRenderItem}
    />
  );
}
