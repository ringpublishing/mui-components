import React, { useContext } from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, IconButton } from '@mui/material';
import { DragHandle as DragHandleIcon } from '@mui/icons-material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { SORTABLE_ITEM_CONTEXT, SortableItem, SortableItemData } from '../../internal/SortableItem.js';

export type { SortableItemData };

export interface SortableListProps<T extends SortableItemData> extends CommonComponentProps {
    /**
     * List of items to be sorted
     */
    items: T[];

    /**
     * Function that renders an element of the list.
     * @param item
     */
    renderItem: (item: T) => React.ReactNode;

    /**
     * Function that is called when the order of items changes. It receives a new list of items.
     * @param items
     */
    onChange(items: T[]): void;

    /**
     * If true, items can be grabbed only by the drag handles. Developers need to incorporate `SortableList.DragHandle` component in their item's children.
     * @defaultValue false
     */
    grabByDragHandle?: boolean;
}

/**
 * Returns a ref that can be used to prevent the default drag behavior on the element.
 * This is useful when you want to prevent the drag behavior on an element that is not a drag handle like a button, context menu, etc.
 *
 * This hook returns a union of `RefObject` and `setRef` function of type `RefCallback`. The `RefObject` is a readonly
 * `ref` container that can be used to access a DOM element. The `setRef` is a function that can passed to `ref` prop of a JSX element.
 *
 * @example Make element (button) not draggable
 *  ```tsx
 *  function SortableListItem(props: { item: Item; }): React.JSX.Element {
 *      const ref = useNonDraggableRef<HTMLButtonElement>();
 *
 *      return (
 *          <div>
 *              <p>This fragment is draggable but the button is not</p>
 *              <button ref={ref.setRef} onClick={(event): void => console.log(event)}>CLICK</button>
 *          </div>
 *      );
 *  }
 *  ```
 *
 * @example Make element not draggable and pass ref to another component (e.g. ActionBox)
 * ```tsx
 *  function SortableListItem(props: { item: Item; }): React.JSX.Element {
 *      const ref = useNonDraggableRef<HTMLButtonElement>();
 *
 *      return (
 *          <div>
 *              <p>This fragment is draggable but the button is not</p>
 *              <button ref={ref.setRef} onClick={(event): void => foo(event)}>CLICK</button>
 *               <ActionBox
 *                   actions={[{
 *                      label: 'Option 1',
 *                       onClick: action('ActionBox -> Option 1')
 *                   }]}
 *                   anchorEl={ref}
 *               />
 *          </div>
 *      );
 *  }
 * ```
 */
export function useNonDraggableRef<T extends HTMLElement = HTMLElement>(): React.RefObject<T | null> & {
    setRef: React.RefCallback<T>;
} {
    const ref = React.useRef<T | null>(null);
    const setRef = React.useCallback((node: T | null) => {
        if (ref.current) {
            // Cleanup event listeners from the previous element
            ref.current.removeEventListener('pointerdown', handler);
            ref.current.removeEventListener('keydown', handler);
        }

        if (node) {
            // Attach event listeners to the new element
            node.addEventListener('pointerdown', handler);
            node.addEventListener('keydown', handler);
        }

        ref.current = node;
    }, []);

    const handler = React.useCallback((event: HTMLElementEventMap['pointerdown'] | HTMLElementEventMap['keydown']) => {
        event.stopPropagation();
    }, []);

    return React.useMemo(
        () => ({
            get current() {
                return ref.current;
            },
            setRef,
        }),
        [setRef],
    );
}

export function SortableList<T extends SortableItemData>(props: SortableListProps<T>): React.JSX.Element {
    const { items, renderItem, onChange, grabByDragHandle, sx, className } = props;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 125,
                tolerance: 10,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <Box sx={sx} className={className}>
            <DndContext
                sensors={sensors}
                onDragEnd={(event: DragEndEvent): void => {
                    const { active, over } = event;
                    const hasOrderChanged = over !== null && active.id !== over.id;

                    if (hasOrderChanged) {
                        const activeIndex = items.findIndex(({ id }) => id === active.id);
                        const overIndex = items.findIndex(({ id }) => id === over.id);

                        onChange(arrayMove(items, activeIndex, overIndex));
                    }
                }}
            >
                <SortableContext items={items}>
                    {items.map((item) => (
                        <SortableItem id={item.id} key={item.id} grabByDragHandle={grabByDragHandle}>
                            {renderItem(item)}
                        </SortableItem>
                    ))}
                </SortableContext>
            </DndContext>
        </Box>
    );
}

/**
 * Drag handle component that should be used inside children of SortableList when SortableList's grabByDragHandle is true.
 */
SortableList.DragHandle = function DragHandle(): React.JSX.Element {
    const { attributes, listeners, ref, isDragging } = useContext(SORTABLE_ITEM_CONTEXT);

    return (
        <IconButton
            {...attributes}
            {...listeners}
            ref={ref}
            disableRipple={false}
            disableTouchRipple={true}
            disableFocusRipple={false}
            sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <DragHandleIcon />
        </IconButton>
    );
};
