import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadLibrary, renderTree, setupMessage, TREES } from './renderTree.js';

// Each state imports the whole library afresh, which takes several seconds on a cold or busy run.
vi.setConfig({ testTimeout: 60_000 });

// Stands in for an application that does not have the optional peer installed: any import of it fails, as it does
// at runtime when the package is missing. Counterpart of `withReactQuery.spec.tsx`.
vi.mock('@tanstack/react-query', () => {
    throw new Error("Cannot find package '@tanstack/react-query'");
});

describe.each(TREES)('%s without @tanstack/react-query installed', (tree) => {
    const staticItems = [
        { itemId: 'parent', label: 'Parent', expanded: true, items: [{ itemId: 'child', label: 'Static child' }] },
    ];

    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('renders static items', async () => {
        const library = await loadLibrary({ withDynamicLoading: false });
        const { getByText } = renderTree(library, tree, staticItems);

        expect(getByText('Static child')).toBeTruthy();
    });

    it('renders static items with dynamic loading enabled', async () => {
        // Enabling only registers lazy loaders; the package is first imported when a tree with loadItems renders.
        const library = await loadLibrary({ withDynamicLoading: true });
        const { getByText } = renderTree(library, tree, staticItems);

        expect(getByText('Static child')).toBeTruthy();
    });

    it('asks for enableTreeDynamicLoading() when an item has loadItems', async () => {
        const library = await loadLibrary({ withDynamicLoading: false });
        const { findByRole } = renderTree(library, tree, [
            { itemId: 'parent', label: 'Parent', loadItems: (): [] => [] },
        ]);

        expect((await findByRole('alert')).textContent).toBe(setupMessage(tree));
    });

    it('fails to load the dynamic implementation when dynamic loading is enabled but the package is missing', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const { findByRole } = renderTree(library, tree, [
            { itemId: 'parent', label: 'Parent', loadItems: (): [] => [] },
        ]);

        expect((await findByRole('alert')).textContent).toContain("Cannot find package '@tanstack/react-query'");
    });
});
