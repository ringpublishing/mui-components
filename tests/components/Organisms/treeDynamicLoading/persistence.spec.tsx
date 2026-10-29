import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadLibrary, renderTree, TREES } from './renderTree.js';

// Each state imports the whole library afresh, which takes several seconds on a cold or busy run.
vi.setConfig({ testTimeout: 60_000 });

const LOAD_TIMEOUT = { timeout: 5000 };
const CACHE_STORAGE_KEY = 'ring-tree-cache-nav';
const APP_QUERY_KEY = ['app', 'user'];

function readPersistedKeys(): unknown[] {
    const persisted = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) ?? '[]') as Array<[unknown, unknown]>;

    return persisted.map(([queryKey]) => queryKey);
}

function neverResolves<T>(): Promise<T> {
    return new Promise<T>(() => undefined);
}

describe.each(TREES)('%s persistence of the query cache', (tree) => {
    const treeQueryKeyRoot = tree === 'SimpleTree' ? 'simpleTreeItem' : 'dataTreeItem';

    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => localStorage.clear());

    it('saves only its own queries from a shared queryClient', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const appClient = new QueryClient();

        appClient.setQueryData(APP_QUERY_KEY, { email: 'old@x', when: new Date() });
        appClient.setQueryData([treeQueryKeyRoot, 'other-tree', 'parent'], [{ itemId: 'x', label: 'Other tree' }]);

        const { findByText } = renderTree(
            library,
            tree,
            [
                {
                    itemId: 'parent',
                    label: 'Parent',
                    expanded: true,
                    loadItems: (): Promise<Array<{ itemId: string; label: string }>> =>
                        Promise.resolve([{ itemId: 'child', label: 'Loaded child' }]),
                },
            ],
            { queryClient: appClient, queryKeyPrefix: 'nav', persistence: { cacheKey: 'nav' } },
        );

        expect(await findByText('Loaded child', undefined, LOAD_TIMEOUT)).toBeTruthy();
        expect(readPersistedKeys()).toEqual([[treeQueryKeyRoot, 'nav', 'parent']]);
    });

    it('restores only its own queries into a shared queryClient', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const appClient = new QueryClient();
        const when = new Date('2026-10-27T10:00:00.000Z');

        appClient.setQueryData(APP_QUERY_KEY, { email: 'fresh@x', when });
        localStorage.setItem(
            CACHE_STORAGE_KEY,
            JSON.stringify([
                [APP_QUERY_KEY, { email: 'old@x', when: '2026-01-01T00:00:00.000Z' }],
                [[treeQueryKeyRoot, 'nav', 'parent'], [{ itemId: 'child', label: 'Cached child' }]],
            ]),
        );

        const { findByText } = renderTree(
            library,
            tree,
            [{ itemId: 'parent', label: 'Parent', expanded: true, loadItems: neverResolves }],
            { queryClient: appClient, queryKeyPrefix: 'nav', persistence: { cacheKey: 'nav' } },
        );

        expect(await findByText('Cached child', undefined, LOAD_TIMEOUT)).toBeTruthy();

        const appData = appClient.getQueryData<{ email: string; when: Date }>(APP_QUERY_KEY);

        expect(appData?.email).toBe('fresh@x');
        expect(appData?.when).toBeInstanceOf(Date);
        expect(appClient.getQueryState(APP_QUERY_KEY)?.isInvalidated).toBe(false);
    });

    it('restores its loaded children after a remount with its own queryClient', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const persistence = { cacheKey: 'nav' };
        const firstMount = renderTree(
            library,
            tree,
            [
                {
                    itemId: 'parent',
                    label: 'Parent',
                    expanded: true,
                    loadItems: (): Promise<Array<{ itemId: string; label: string }>> =>
                        Promise.resolve([{ itemId: 'child', label: 'Loaded child' }]),
                },
            ],
            { persistence },
        );

        expect(await firstMount.findByText('Loaded child', undefined, LOAD_TIMEOUT)).toBeTruthy();
        firstMount.unmount();

        const { findByText } = renderTree(
            library,
            tree,
            [{ itemId: 'parent', label: 'Parent', expanded: true, loadItems: neverResolves }],
            { persistence },
        );

        expect(await findByText('Loaded child', undefined, LOAD_TIMEOUT)).toBeTruthy();
    });
});
