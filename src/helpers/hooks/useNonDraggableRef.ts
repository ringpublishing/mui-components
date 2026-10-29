import React from 'react';

/**
 * Returns a ref that prevents the default drag behaviour on the element it is attached to, e.g. a
 * button or context menu inside a draggable item. The result is a `RefObject` plus a `setRef`
 * callback to pass to the element's `ref` prop.
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
export function useNonDraggableRef<T extends Element = HTMLElement>(): React.RefObject<T | null> & {
    setRef: React.RefCallback<T>;
} {
    const ref = React.useRef<T | null>(null);

    const handler = React.useCallback((event: Event): void => {
        event.stopPropagation();
    }, []);

    const setRef = React.useCallback(
        (node: T | null) => {
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
        },
        [handler],
    );

    return React.useMemo(
        () => ({
            get current(): T | null {
                return ref.current;
            },
            setRef,
        }),
        [setRef],
    );
}
