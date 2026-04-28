import { TreeViewItem } from '../../../../../src/components/Organisms/TreeView/TreeView.js';

export function moveItems(
    items: TreeViewItem[],
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[],
): TreeViewItem[] {
    const newItems = [...items];

    function getArrayAndIndex(path: number[]): { array: TreeViewItem[] | undefined; index: number } {
        let array: TreeViewItem[] | undefined = newItems;
        let index = path[0];

        for (let i = 0; i < path.length - 1; i++) {
            const currentIndex = path[i];

            if (!array?.[currentIndex]?.items) {
                return { array: undefined, index: -1 };
            }

            array = array[currentIndex].items;
            index = path[i + 1];
        }

        return { array, index };
    }

    const { array: sourceArray, index: sourceIndex } = getArrayAndIndex(sourceAbsolutePosition);
    const { array: destinationArray, index: destinationIndex } = getArrayAndIndex(destinationAbsolutePosition);

    if (!sourceArray || sourceIndex === -1 || !sourceArray[sourceIndex]) {
        throw new Error('Invalid source position');
    }

    const [movedItem] = sourceArray.splice(sourceIndex, 1);

    if (!destinationArray) {
        throw new Error('Invalid destination position');
    }

    destinationArray.splice(destinationIndex, 0, movedItem);

    return newItems;
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
