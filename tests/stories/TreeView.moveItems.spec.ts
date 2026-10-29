import { describe, expect, it } from 'vitest';
import { moveItems } from '../../stories/components/Organisms/TreeView/common/helpers.js';
import { TreeViewItem } from '../../src/components/Organisms/TreeView/TreeView.js';

const buildItems = (): TreeViewItem[] => [
    {
        itemId: '0',
        label: 'Item 0',
        items: [
            { itemId: '0.0', label: 'Item 0.0' },
            {
                itemId: '0.1',
                label: 'Item 0.1',
                items: [
                    { itemId: '0.1.0', label: 'Item 0.1.0' },
                    { itemId: '0.1.1', label: 'Item 0.1.1' },
                ],
            },
            { itemId: '0.2', label: 'Item 0.2' },
        ],
    },
    { itemId: '1', label: 'Item 1' },
];

describe('TreeView stories - moveItems', () => {
    it('should move a nested item without mutating the input tree', () => {
        const items = buildItems();
        const snapshot = structuredClone(items);

        const result = moveItems(items, [0, 1], [0, 2]);

        // The input tree is untouched at every nesting level.
        expect(items).toEqual(snapshot);
        // The moved item landed at its destination.
        expect(result[0].items?.map((i) => i.itemId)).toEqual(['0.0', '0.2', '0.1']);
        // Objects along the changed path are fresh copies...
        expect(result[0]).not.toBe(items[0]);
        expect(result[0].items).not.toBe(items[0].items);
        // ...while untouched subtrees keep their identity.
        expect(result[1]).toBe(items[1]);
    });

    it('should move an item between different parents immutably', () => {
        const items = buildItems();
        const snapshot = structuredClone(items);

        const result = moveItems(items, [0, 1, 0], [1]);

        expect(items).toEqual(snapshot);
        expect(result[0].items?.[1].items?.map((i) => i.itemId)).toEqual(['0.1.1']);
        expect(result[1].itemId).toBe('0.1.0');
    });

    it('should be idempotent across repeated calls on the same input (no state corruption)', () => {
        const items = buildItems();

        const first = moveItems(items, [0, 0], [0, 2]);
        // Snapshot before the second call: with a mutating implementation `first`
        // and `second` would be the same corrupted object and compare equal.
        const firstSnapshot = structuredClone(first);
        const second = moveItems(items, [0, 0], [0, 2]);

        expect(second).toEqual(firstSnapshot);
        expect(second[0].items?.map((i) => i.itemId)).toEqual(['0.1', '0.2', '0.0']);
    });

    it('should move an item up within the same parent', () => {
        const items = buildItems();

        const result = moveItems(items, [0, 2], [0, 0]);

        expect(result[0].items?.map((i) => i.itemId)).toEqual(['0.2', '0.0', '0.1']);
    });

    it('should keep the intended parent when the destination path descends through a later sibling', () => {
        // Both paths are computed against the tree BEFORE removal: after taking
        // out A, index 1 would point past B — the path must be shifted.
        const items: TreeViewItem[] = [
            { itemId: 'A', label: 'A', items: [{ itemId: 'A0', label: 'A0' }] },
            { itemId: 'B', label: 'B', items: [{ itemId: 'B0', label: 'B0' }] },
        ];

        const result = moveItems(items, [0], [1, 0]);

        expect(result.map((i) => i.itemId)).toEqual(['B']);
        expect(result[0].items?.map((i) => i.itemId)).toEqual(['A', 'B0']);
    });

    it('should throw when the destination lies inside the moved subtree', () => {
        expect(() => moveItems(buildItems(), [0], [0, 0])).toThrow('Invalid destination position');
    });

    it('should throw on an invalid source position', () => {
        expect(() => moveItems(buildItems(), [5], [0])).toThrow('Invalid source position');
    });

    it('should throw on an invalid destination position', () => {
        expect(() => moveItems(buildItems(), [0, 0], [1, 0, 0])).toThrow('Invalid destination position');
    });
});
