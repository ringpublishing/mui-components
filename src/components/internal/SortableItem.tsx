import { DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import React, { createContext, PropsWithChildren, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SortableItemContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
    isDragging: boolean;
}

export const SORTABLE_ITEM_CONTEXT = createContext<SortableItemContext>({
    attributes: {},
    listeners: undefined,
    ref() {
        /* noop */
    },
    isDragging: false,
});

export type SortableItemData = { id: UniqueIdentifier };

interface SortableItemProps {
    id: UniqueIdentifier;
    grabByDragHandle?: boolean;
    disableDrag?: boolean;
    disableTransformOfUndraggedItems?: boolean;
}

export function SortableItem(props: PropsWithChildren<SortableItemProps>): React.JSX.Element {
    const { children, grabByDragHandle, disableDrag, disableTransformOfUndraggedItems } = props;
    const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } = useSortable({
        id: props.id,
    });

    const context = useMemo(
        () => ({
            attributes: disableDrag ? {} : attributes,
            listeners: disableDrag ? {} : listeners,
            ref: setActivatorNodeRef, // Used to attach to the drag handle
            isDragging,
        }),
        [attributes, listeners, setActivatorNodeRef, isDragging, disableDrag],
    );

    const transformRecalculated = transform
        ? { ...transform, x: isDragging ? transform.x : 0, y: isDragging ? transform.y : 0 }
        : null;

    const style: React.CSSProperties = {
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none', // See https://docs.dndkit.com/api-documentation/sensors/pointer#recommendations
        transform: CSS.Translate.toString(disableTransformOfUndraggedItems ? transformRecalculated : transform),
        transition,
        WebkitUserSelect: 'none', // Do not show the "magnifying glass" on mobile Safari
        cursor: disableDrag ? 'default' : isDragging ? 'grabbing' : 'grab',
    };

    if (grabByDragHandle) {
        return (
            <SORTABLE_ITEM_CONTEXT.Provider value={context}>
                <div ref={setNodeRef} style={style}>
                    {children}
                </div>
            </SORTABLE_ITEM_CONTEXT.Provider>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...(disableDrag ? {} : attributes)} {...(disableDrag ? {} : listeners)}>
            {children}
        </div>
    );
}
