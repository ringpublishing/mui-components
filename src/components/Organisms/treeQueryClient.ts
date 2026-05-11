// Namespace import (`import * as`) so this file compiles against Vite /
// Rollup's `__vite-optional-peer-dep` stub at the consumer's build time
// even if `@tanstack/react-query` isn't installed. `import { QueryClient }`
// would force the bundler to look for a `QueryClient` named export on the
// stub (which has none) and fail. With `import * as`, the bundler is happy
// — it just gets whatever the stub exports (empty namespace when missing).
// At runtime, accessing `ReactQuery.QueryClient` on the stub is undefined
// and instantiating it throws — but that only happens if a tree actually
// uses `loadItems`, which is the documented opt-in for needing the dep.
import * as ReactQuery from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useState } from 'react';
import { readLocalStorage, writeLocalStorage } from './treeShared.js';

/**
 * Build a TanStack Query client for a tree instance, optionally pre-populated
 * from localStorage when a `localStorageCacheKey` is provided.
 *
 * NOTE: This module is the only place `@tanstack/react-query` is imported under
 * `Organisms/`. It must be loaded exclusively from the dynamic-loading code
 * path (i.e. `SimpleTreeDynamic` / `DataTreeDynamic`) so consumers who never
 * use `loadItems` are not forced to install the optional peer dependency.
 */
export function createQueryClient(localStorageCacheKey?: string): QueryClient {
    const client = new ReactQuery.QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });

    if (localStorageCacheKey) {
        const cached = readLocalStorage<Array<[unknown, unknown]>>(`ring-tree-cache-${localStorageCacheKey}`);

        if (cached) {
            cached.forEach(([queryKey, data]) => {
                client.setQueryData(queryKey as string[], data);
            });
        }
    }

    return client;
}

interface UseTreePersistenceArgs {
    cacheKey: string | undefined;
    queryClientFromProps: QueryClient | undefined;
}

interface UseTreePersistenceResult {
    queryClient: QueryClient;
    stateStorageKey: string | null;
    cacheStorageKey: string | null;
}

/**
 * Wires up the TanStack Query client + localStorage cache persistence for a
 * tree instance. Returns the resolved client (external if provided, otherwise
 * an internal one pre-hydrated from cache) plus the storage keys callers
 * still need for their own state-persistence shapes.
 *
 * Responsibilities:
 *  - Derive the per-instance `state` and `cache` localStorage keys.
 *  - Create an internal client lazily, pre-populated from cache when no
 *    external client is supplied.
 *  - On mount, hydrate an external client from cache and invalidate every
 *    just-hydrated query so the cascading refetch can replace stripped
 *    `loadItems` functions with live ones (see `STRIPPED_FN_MARKER`).
 *  - Persist the cache to localStorage on every cache mutation.
 */
export function useTreePersistence({
    cacheKey,
    queryClientFromProps,
}: UseTreePersistenceArgs): UseTreePersistenceResult {
    const stateStorageKey = cacheKey ? `ring-tree-state-${cacheKey}` : null;
    const cacheStorageKey = cacheKey ? `ring-tree-cache-${cacheKey}` : null;

    const [internalQueryClient] = useState(() =>
        createQueryClient(queryClientFromProps === undefined ? cacheKey : undefined),
    );
    const queryClient = queryClientFromProps ?? internalQueryClient;

    useLayoutEffect(() => {
        if (cacheStorageKey === null) return;
        const cached = readLocalStorage<Array<[unknown, unknown]>>(cacheStorageKey);

        if (!cached) return;

        // External client hydration. The internal client was hydrated inside
        // `createQueryClient` so it does not need this step.
        if (queryClientFromProps !== undefined) {
            cached.forEach(([queryKey, data]) => {
                queryClientFromProps.setQueryData(queryKey as string[], data);
            });
        }

        // Invalidate every just-hydrated query. React Query keeps the cached
        // data visible (no UI flash) and triggers a background refetch for
        // each active subscriber. The refetch's `queryFn` uses the live
        // `loadItems` from `props.items` (root level) — producing fresh
        // children whose own `loadItems` then drive deeper refetches the
        // same way, cascading down the subtree. Without this step,
        // `loadItems` functions stripped during JSON serialization (and
        // replaced with `STRIPPED_FN_MARKER`) would leave previously-
        // expanded dynamic children un-expandable across a page reload.
        cached.forEach(([queryKey]) => {
            queryClient.invalidateQueries({ queryKey: queryKey as readonly unknown[] });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!cacheStorageKey) return;
        const unsubscribe = queryClient.getQueryCache().subscribe(() => {
            const queries = queryClient.getQueryCache().getAll();
            const data = queries.filter((q) => q.state.data !== undefined).map((q) => [q.queryKey, q.state.data]);
            writeLocalStorage(cacheStorageKey, data);
        });

        return unsubscribe;
    }, [queryClient, cacheStorageKey]);

    return { queryClient, stateStorageKey, cacheStorageKey };
}
