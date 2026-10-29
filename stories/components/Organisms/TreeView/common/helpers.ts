import { TreeViewItem } from '../../../../../src/components/Organisms/TreeView/TreeView.js';

export function moveItems(
    items: TreeViewItem[],
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[],
): TreeViewItem[] {
    // Immutable on purpose: the result goes into React state, so every array and
    // object along the source/destination paths must be a fresh copy — splicing
    // nested arrays in place corrupts the previous state object.
    let movedItem: TreeViewItem | undefined;

    function removeAtPath(arr: TreeViewItem[], path: number[], depth: number): TreeViewItem[] {
        const index = path[depth];

        if (depth === path.length - 1) {
            movedItem = arr[index];

            return arr.filter((item, i) => i !== index);
        }

        return arr.map((item, i) =>
            i === index && item.items ? { ...item, items: removeAtPath(item.items, path, depth + 1) } : item,
        );
    }

    function insertAtPath(arr: TreeViewItem[], path: number[], depth: number): TreeViewItem[] {
        const index = path[depth];

        if (depth === path.length - 1) {
            const next = [...arr];
            next.splice(index, 0, movedItem as TreeViewItem);

            return next;
        }

        if (!arr[index]?.items) {
            throw new Error('Invalid destination position');
        }

        return arr.map((item, i) =>
            i === index ? { ...item, items: insertAtPath(item.items as TreeViewItem[], path, depth + 1) } : item,
        );
    }

    // The caller computes both paths against the tree BEFORE removal. Removing
    // the source shifts its later siblings down by one, so a destination path
    // that descends THROUGH such a sibling must be shifted too. A destination
    // ending in the source's parent array is left as-is: insertion happens
    // after removal, matching the previous splice-based semantics.
    function adjustDestinationPath(source: number[], destination: number[]): number[] {
        const parentDepth = source.length - 1;
        const descendsDeeper = destination.length > source.length;
        const sharesParentPath = source.slice(0, parentDepth).every((segment, i) => segment === destination[i]);

        if (!descendsDeeper || !sharesParentPath) {
            return destination;
        }

        if (destination[parentDepth] === source[parentDepth]) {
            // The destination lies inside the moved subtree itself.
            throw new Error('Invalid destination position');
        }

        if (destination[parentDepth] > source[parentDepth]) {
            const adjusted = [...destination];
            adjusted[parentDepth] -= 1;

            return adjusted;
        }

        return destination;
    }

    const withoutItem = removeAtPath(items, sourceAbsolutePosition, 0);

    if (!movedItem) {
        throw new Error('Invalid source position');
    }

    return insertAtPath(withoutItem, adjustDestinationPath(sourceAbsolutePosition, destinationAbsolutePosition), 0);
}

export function dropInItem(items: TreeViewItem[], itemId: string, dropInItemId: string): TreeViewItem[] {
    let movedItem: TreeViewItem | null = null;

    function removeItem(arr: TreeViewItem[]): TreeViewItem[] {
        return arr.reduce<TreeViewItem[]>((acc, item) => {
            if (item.itemId === itemId) {
                movedItem = item;

                return acc;
            }

            if (item.items) {
                acc.push({ ...item, items: removeItem(item.items) });
            } else {
                acc.push(item);
            }

            return acc;
        }, []);
    }

    function insertItem(arr: TreeViewItem[]): TreeViewItem[] {
        return arr.map((item) => {
            if (item.itemId === dropInItemId) {
                const children = item.items ? [...item.items] : [];

                if (movedItem) {
                    children.push({ ...movedItem, items: movedItem.items ?? undefined });
                }

                return { ...item, items: children };
            }

            if (item.items) {
                return { ...item, items: insertItem(item.items) };
            }

            return item;
        });
    }

    const withoutItem = removeItem(items);

    if (!movedItem) {
        return items;
    }

    return insertItem(withoutItem);
}

export function checkItem(items: TreeViewItem[], itemId: string, checked: boolean): TreeViewItem[] {
    const newItems: TreeViewItem[] = [];

    items.forEach((item) => {
        if (item.itemId === itemId) {
            newItems.push({ ...item, checked });
        } else if (item.items) {
            newItems.push({ ...item, items: checkItem(item.items, itemId, checked) });
        } else {
            newItems.push(item);
        }
    });

    return newItems;
}
