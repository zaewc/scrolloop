<script lang="ts" generics="T">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import { createInfinitePages } from "./stores/createInfinitePages";
  import VirtualList from "./VirtualList.svelte";
  import type { InfiniteSourceOptions } from "@scrolloop/shared";

  interface Props {
    fetchPage: InfiniteSourceOptions<T>["fetchPage"];
    pageSize?: number;
    initialPage?: number;
    itemSize: number;
    height?: number;
    overscan?: number;
    children: Snippet<[index: number, item: T | undefined, style: Record<string, string>]>;
    error?: Snippet<[err: Error, retry: () => void]>;
    loading?: Snippet;
    empty?: Snippet;
  }

  let {
    fetchPage,
    pageSize = 20,
    initialPage = 0,
    itemSize,
    height = 400,
    overscan,
    children,
    error: errorSnippet,
    loading: loadingSnippet,
    empty: emptySnippet,
  }: Props = $props();

  const source = createInfinitePages<T>({ fetchPage, pageSize, initialPage });

  const allItems = $derived($source.allItems);
  const loadingPages = $derived($source.loadingPages);
  const errorState = $derived($source.error);
  const hasMore = $derived($source.hasMore);

  const effectiveOverscan = $derived(overscan ?? Math.max(20, pageSize * 2));

  onMount(() => {
    const needed = Math.ceil(height / itemSize) + effectiveOverscan * 2;
    const pagesToLoad = Math.ceil(needed / pageSize);
    for (let p = 0; p < pagesToLoad; p++) {
      source.loadPage(p);
    }
  });

  function handleRangeChange(range: { startIndex: number; endIndex: number }) {
    const ps = (range.startIndex / pageSize) | 0;
    const pe = ((range.endIndex / pageSize) | 0) + 1;
    for (let p = ps; p <= pe; p++) {
      source.loadPage(p);
    }
  }
</script>

{#if errorState && !allItems.length}
  {#if errorSnippet}
    {@render errorSnippet(errorState, source.retry)}
  {:else}
    <div style:height="{height}px" style:display="flex" style:align-items="center" style:justify-content="center">
      <div style:text-align="center">
        <p>Error.</p>
        <p style:color="#666" style:font-size="0.9em">{errorState.message}</p>
        <button onclick={source.retry} style:margin-top="8px" style:padding="4px 12px" style:cursor="pointer">
          Retry
        </button>
      </div>
    </div>
  {/if}
{:else if !allItems.length && loadingPages.size > 0}
  {#if loadingSnippet}
    <div style:height="{height}px">{@render loadingSnippet()}</div>
  {:else}
    <div style:height="{height}px" style:display="flex" style:align-items="center" style:justify-content="center">
      <p>Loading...</p>
    </div>
  {/if}
{:else if !allItems.length && !hasMore}
  {#if emptySnippet}
    <div style:height="{height}px">{@render emptySnippet()}</div>
  {:else}
    <div style:height="{height}px" style:display="flex" style:align-items="center" style:justify-content="center">
      <p>No data.</p>
    </div>
  {/if}
{:else}
  <VirtualList
    count={allItems.length}
    {itemSize}
    {height}
    overscan={effectiveOverscan}
    onRangeChange={handleRangeChange}
  >
    {#snippet children(index, style)}
      {@render children(index, allItems[index], style)}
    {/snippet}
  </VirtualList>
{/if}
