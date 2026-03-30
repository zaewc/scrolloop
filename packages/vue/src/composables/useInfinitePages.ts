import { ref, computed, onUnmounted } from "vue";
import { InfiniteSource } from "@scrolloop/shared";
import type { InfiniteSourceOptions } from "@scrolloop/shared";

export function useInfinitePages<T>(options: InfiniteSourceOptions<T>) {
  const source = new InfiniteSource(options);
  const state = ref(source.getState());

  const unsubscribe = source.subscribe((s) => {
    state.value = s;
  });

  onUnmounted(() => {
    unsubscribe();
    source.destroy();
  });

  return {
    pages: computed(() => state.value.pages),
    loadingPages: computed(() => state.value.loadingPages),
    total: computed(() => state.value.total),
    hasMore: computed(() => state.value.hasMore),
    error: computed(() => state.value.error),
    allItems: computed(() => state.value.allItems),
    loadPage: (page: number) => source.loadPage(page),
    retry: () => source.retry(),
    reset: () => source.reset(),
  };
}
