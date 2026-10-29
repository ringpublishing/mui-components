import { fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enableDynamicLoading, loadLibrary, renderTree, setupMessage, TREES } from './renderTree.js';

// Each state imports the whole library afresh, which takes several seconds on a cold or busy run.
vi.setConfig({ testTimeout: 60_000 });

// Counterpart of `withoutReactQuery.spec.tsx`: here `@tanstack/react-query` is installed (a devDependency).
const LOAD_TIMEOUT = { timeout: 5000 };

describe.each(TREES)('%s with @tanstack/react-query installed', (tree) => {
    const testIdPrefix = `ring-${tree.toLowerCase()}-item`;

    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('renders static items without dynamic loading enabled', async () => {
        const library = await loadLibrary({ withDynamicLoading: false });
        const { getByText } = renderTree(library, tree, [
            { itemId: 'parent', label: 'Parent', expanded: true, items: [{ itemId: 'child', label: 'Static child' }] },
        ]);

        expect(getByText('Static child')).toBeTruthy();
    });

    it('asks for enableTreeDynamicLoading() when an item has loadItems', async () => {
        const library = await loadLibrary({ withDynamicLoading: false });
        const loadItems = vi.fn(() => []);
        const { findByRole } = renderTree(library, tree, [{ itemId: 'parent', label: 'Parent', loadItems }]);

        expect((await findByRole('alert')).textContent).toBe(setupMessage(tree));
        expect(loadItems).not.toHaveBeenCalled();
    });

    it('loads children through loadItems once dynamic loading is enabled', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const parent = {
            itemId: 'parent',
            label: 'Parent',
            expanded: true,
            loadItems: vi.fn(() => Promise.resolve([{ itemId: 'child', label: 'Loaded child' }])),
        };
        const { findByText } = renderTree(library, tree, [parent]);

        expect(await findByText('Loaded child', undefined, LOAD_TIMEOUT)).toBeTruthy();
        expect(parent.loadItems).toHaveBeenCalledTimes(1);
        expect(parent.loadItems).toHaveBeenCalledWith(expect.objectContaining({ itemId: 'parent' }));
    });

    it('recovers when dynamic loading is enabled after a tree with loadItems first rendered', async () => {
        const library = await loadLibrary({ withDynamicLoading: false, fresh: true });
        const items = [
            {
                itemId: 'parent',
                label: 'Parent',
                expanded: true,
                loadItems: (): Promise<Array<{ itemId: string; label: string }>> =>
                    Promise.resolve([{ itemId: 'child', label: 'Loaded child' }]),
            },
        ];
        const beforeEnabling = renderTree(library, tree, items);

        expect((await beforeEnabling.findByRole('alert')).textContent).toBe(setupMessage(tree));
        beforeEnabling.unmount();

        await enableDynamicLoading();

        const { findByText } = renderTree(library, tree, items);

        expect(await findByText('Loaded child', undefined, LOAD_TIMEOUT)).toBeTruthy();
    });

    it('retries a failed loadItems from the refresh button', async () => {
        const library = await loadLibrary({ withDynamicLoading: true });
        const loadItems = vi
            .fn()
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce([{ itemId: 'child', label: 'Loaded after retry' }]);
        const { findByTestId, findByText } = renderTree(library, tree, [
            { itemId: 'parent', label: 'Parent', expanded: true, loadItems },
        ]);

        fireEvent.click(await findByTestId(`${testIdPrefix}-parent-refresh`, undefined, LOAD_TIMEOUT));

        expect(await findByText('Loaded after retry', undefined, LOAD_TIMEOUT)).toBeTruthy();
        expect(loadItems).toHaveBeenCalledTimes(2);
    });
});
