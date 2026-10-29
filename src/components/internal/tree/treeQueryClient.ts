import { QueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useState } from 'react';
import { readLocalStorage, TreeQueryClient, writeLocalStorage } from './treeShared.js';

/** The first two elements of every query key a tree instance owns: `[queryKeyRoot, instanceId]`. */
type TreeQueryKeyScope = readonly [string, string];

type PersistedQueries = Array<[unknown, unknown]>;

function isInScope(queryKey: unknown, [queryKeyRoot, instanceId]: TreeQueryKeyScope): boolean {
    return Array.isArray(queryKey) && queryKey[0] === queryKeyRoot && queryKey[1] === instanceId;
}

/**
 * Reads the persisted cache entries of one tree instance. Entries under other keys are skipped, so a cache saved
 * from a shared app client never writes the app's own queries back.
 */
function readPersistedQueries(cacheStorageKey: string, scope: TreeQueryKeyScope): PersistedQueries {
    const cached = readLocalStorage<PersistedQueries>(cacheStorageKey) ?? [];

    return cached.filter(([queryKey]) => isInScope(queryKey, scope));
}

/**
 * Builds a TanStack Query client for a tree instance, pre-populated with the given persisted queries. Import it
 * only from the dynamic-loading chunks (`SimpleTreeDynamic` / `DataTreeDynamic`), never from code the package
 * root reaches.
 */
export function createQueryClient(cachedQueries: PersistedQueries = []): QueryClient {
    const client = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });

    cachedQueries.forEach(([queryKey, data]) => {
        client.setQueryData(queryKey as string[], data);
    });

    return client;
}

interface UseTreePersistenceArgs {
    cacheKey: string | undefined;
    queryClientFromProps: TreeQueryClient | undefined;
    /** First element of the tree's query keys, e.g. `simpleTreeItem`. */
    queryKeyRoot: string;
    /** Second element of the tree's query keys. */
    instanceId: string;
}

interface UseTreePersistenceResult {
    queryClient: QueryClient;
    stateStorageKey: string | null;
    cacheStorageKey: string | null;
}

/**
 * Wires up the TanStack Query client and the localStorage cache persistence for a tree instance:
 * derives the per-instance storage keys, creates or hydrates the client from the cache, and writes
 * the cache back on every mutation, all limited to the queries under `[queryKeyRoot, instanceId]`.
 * Returns the resolved client (the external one when provided) and the storage keys.
 */
export function useTreePersistence({
    cacheKey,
    queryClientFromProps: queryClientProp,
    queryKeyRoot,
    instanceId,
}: UseTreePersistenceArgs): UseTreePersistenceResult {
    // The prop is typed by shape so the package root's types need no `@tanstack/react-query`; it is the app's
    // `QueryClient`, the one `QueryClientProvider` and the per-item queries run on.
    const queryClientFromProps = queryClientProp as QueryClient | undefined;
    const stateStorageKey = cacheKey ? `ring-tree-state-${cacheKey}` : null;
    const cacheStorageKey = cacheKey ? `ring-tree-cache-${cacheKey}` : null;

    const [internalQueryClient] = useState(() =>
        createQueryClient(
            queryClientFromProps === undefined && cacheStorageKey !== null
                ? readPersistedQueries(cacheStorageKey, [queryKeyRoot, instanceId])
                : [],
        ),
    );
    const queryClient = queryClientFromProps ?? internalQueryClient;

    useLayoutEffect(() => {
        if (cacheStorageKey === null) return;
        const cached = readPersistedQueries(cacheStorageKey, [queryKeyRoot, instanceId]);

        // External client hydration. The internal client was hydrated inside
        // `createQueryClient` so it does not need this step.
        if (queryClientFromProps !== undefined) {
            cached.forEach(([queryKey, data]) => {
                queryClientFromProps.setQueryData(queryKey as string[], data);
            });
        }

        // Invalidate every just-hydrated query: the cached data stays visible while a background
        // refetch runs with the live `loadItems`, cascading down the subtree. Without it, the
        // `loadItems` functions stripped by JSON serialization (`STRIPPED_FN_MARKER`) would leave
        // expanded dynamic children un-expandable after a page reload.
        cached.forEach(([queryKey]) => {
            queryClient.invalidateQueries({ queryKey: queryKey as readonly unknown[] });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!cacheStorageKey) return;
        const scope: TreeQueryKeyScope = [queryKeyRoot, instanceId];
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (!isInScope(event.query.queryKey, scope)) return;
            const queries = queryClient.getQueryCache().getAll();
            const data = queries
                .filter((q) => q.state.data !== undefined && isInScope(q.queryKey, scope))
                .map((q) => [q.queryKey, q.state.data]);
            writeLocalStorage(cacheStorageKey, data);
        });

        return unsubscribe;
    }, [queryClient, cacheStorageKey, queryKeyRoot, instanceId]);

    return { queryClient, stateStorageKey, cacheStorageKey };
}
