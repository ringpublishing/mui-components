import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react';

import { SortableList } from '../../../src/index.js';

interface Item {
    id: string;
    name: string;
}

const ITEMS = [1, 2, 3, 4, 5].map<Item>((num) => ({ id: num.toString(), name: `Value ${num}` }));

describe('SortableList', () => {
    it('Should render correctly', () => {
        const onChange = vi.fn();
        const ItemElement = ({ item }: { item: Item }): React.JSX.Element => (
            <div id={`item-${item.id}`}>{item.name}</div>
        );

        const { container } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                renderItem={(item): React.JSX.Element => <ItemElement item={item} />}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it("Should allow elements with clickable actions in the list's element", () => {
        const onChange = vi.fn();
        const onClick = vi.fn();
        const ItemElement = ({ item }: { item: Item }): React.JSX.Element => (
            <div id={`item-${item.id}`}>
                {item.name}
                <button onClick={(): void => onClick(item.id)}>Click action for {item.id}</button>
            </div>
        );

        const { getByText } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                renderItem={(item): React.JSX.Element => <ItemElement item={item} />}
            />,
        );

        const button = getByText('Click action for 1');
        button.click();

        expect(onClick).toHaveBeenCalledWith('1');
    });

    it('Should render correctly with orientation="horizontal"', () => {
        const onChange = vi.fn();

        const { container } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                orientation="horizontal"
                renderItem={(item): React.JSX.Element => <div>{item.name}</div>}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it('Should render all items with orientation="wrap"', () => {
        const onChange = vi.fn();

        const { getByText, container } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                orientation="wrap"
                renderItem={(item): React.JSX.Element => <div>{item.name}</div>}
            />,
        );

        ITEMS.forEach(({ name }) => {
            expect(getByText(name)).toBeDefined();
        });
        expect(container).toMatchSnapshot();
    });

    it('Should allow clickable actions inside items with orientation="wrap"', () => {
        const onChange = vi.fn();
        const onClick = vi.fn();

        const { getByText } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                orientation="wrap"
                renderItem={(item): React.JSX.Element => (
                    <div>
                        {item.name}
                        <button onClick={(): void => onClick(item.id)}>Click action for {item.id}</button>
                    </div>
                )}
            />,
        );

        getByText('Click action for 1').click();

        expect(onClick).toHaveBeenCalledWith('1');
    });

    it('Should expose a root and per-item data-testid, overridable per item', () => {
        const onChange = vi.fn();

        const { queryByTestId } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                dataTestIdSuffix="Ranking"
                getItemDataTestId={(item, index): string | undefined => (index === 0 ? 'my-first-row' : undefined)}
                renderItem={(item): React.JSX.Element => <div>{item.name}</div>}
            />,
        );

        expect(queryByTestId('ring-sortablelist-ranking')).not.toBeNull();
        expect(queryByTestId('my-first-row')).not.toBeNull();
        expect(queryByTestId('ring-sortablelist-ranking-item-2')).not.toBeNull();
    });

    it('Should render the vertical grip glyph in SortableList.DragHandle', () => {
        const onChange = vi.fn();

        const { container } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                grabByDragHandle={true}
                renderItem={(item): React.JSX.Element => (
                    <div>
                        <SortableList.DragHandle />
                        {item.name}
                    </div>
                )}
            />,
        );

        // Asserted on the lucide class rather than by snapshot: `lucide-react` floats on a caret
        // range with no lockfile, so icon markup churns on every minor.
        expect(container.querySelectorAll('svg.lucide-grip-vertical').length).toBe(ITEMS.length);
        expect(container.querySelector('svg.lucide-grip-horizontal')).toBeNull();
    });

    it('Should give SortableList.DragHandle an accessible name, localisable through labels', () => {
        const onChange = vi.fn();
        const renderList = (labels?: { dragHandle?: string }): ReturnType<typeof render> =>
            render(
                <SortableList
                    items={ITEMS}
                    onChange={onChange}
                    grabByDragHandle={true}
                    labels={labels}
                    renderItem={(item): React.JSX.Element => (
                        <div>
                            <SortableList.DragHandle />
                            {item.name}
                        </div>
                    )}
                />,
            );

        // An icon-only button with no name is announced as "button" and fails axe `button-name`.
        expect(renderList().getAllByRole('button', { name: 'Drag to reorder' })).toHaveLength(ITEMS.length);
        expect(
            renderList({ dragHandle: 'Przeciągnij, aby zmienić kolejność' }).getAllByRole('button', {
                name: 'Przeciągnij, aby zmienić kolejność',
            }),
        ).toHaveLength(ITEMS.length);
    });

    it('Should advertise the keyboard drag only where a KeyboardSensor is mounted', () => {
        const onChange = vi.fn();
        const renderList = (orientation: 'vertical' | 'wrap'): HTMLElement =>
            render(
                <SortableList
                    items={ITEMS}
                    onChange={onChange}
                    orientation={orientation}
                    renderItem={(item): React.JSX.Element => <div>{item.name}</div>}
                />,
            ).container;

        // `vertical` keeps `keyboardSorting`, so the items stay keyboard-operable draggables.
        const vertical = renderList('vertical');

        expect(vertical.querySelectorAll('[aria-roledescription="sortable"]').length).toBe(ITEMS.length);
        expect(vertical.querySelectorAll('[role="button"][tabindex="0"]').length).toBe(ITEMS.length);
        expect(vertical.textContent).toContain('space bar');

        // `wrap` is pointer-only, so advertising a keyboard drag would be a promise it cannot keep.
        const wrap = renderList('wrap');

        expect(wrap.querySelectorAll('[aria-roledescription="sortable"]').length).toBe(0);
        expect(wrap.querySelectorAll('[role="button"]').length).toBe(0);
        expect(wrap.querySelectorAll('[tabindex="0"]').length).toBe(0);
        expect(wrap.textContent).not.toContain('space bar');
    });

    it.each(['vertical', 'horizontal'] as const)(
        'Should keep SortableList.DragHandle focusable while its item is the drop slot (%s)',
        async (orientation) => {
            // A `visibility: hidden` element cannot hold focus: a browser blurs it on the spot and
            // refuses to focus it again, so a handle hidden with the rest of the slot's content
            // would drop keyboard focus the moment the item is picked up.
            const { container, getAllByRole } = render(
                <SortableList
                    items={ITEMS}
                    onChange={vi.fn()}
                    orientation={orientation}
                    grabByDragHandle={true}
                    renderItem={(item): React.JSX.Element => (
                        <div>
                            <SortableList.DragHandle />
                            <span>{item.name}</span>
                        </div>
                    )}
                />,
            );
            const handle = getAllByRole('button', { name: 'Drag to reorder' })[0];
            const label = within(container).getByText('Value 1');

            act(() => handle.focus());
            fireEvent.keyDown(handle, { key: ' ', code: 'Space' });

            // The drag is up: the picked-up item is the drop slot and its content is hidden …
            expect(getComputedStyle(label).visibility).toBe('hidden');
            // … except the handle, which stays rendered (so it keeps focus) but paints nothing.
            expect(getComputedStyle(handle).visibility).toBe('visible');
            expect(getComputedStyle(handle).opacity).toBe('0');
            expect(document.activeElement).toBe(handle);

            // dnd-kit's KeyboardSensor starts listening for the drop key on the next tick.
            await act(() => new Promise((resolve) => setTimeout(resolve)));
            fireEvent.keyDown(handle, { key: 'Escape', code: 'Escape' });

            // The slot stays up while the ghost flies back, which is when focus is restored.
            expect(getComputedStyle(handle).visibility).toBe('visible');
            expect(document.activeElement).toBe(handle);

            await waitFor(() => expect(getComputedStyle(label).visibility).toBe('visible'));
            expect(getComputedStyle(handle).opacity).not.toBe('0');
            expect(document.activeElement).toBe(handle);
        },
    );

    // FIXME: Test the drag and drop functionality in jsdom

    it('Should put sx, className and data-testid on the one root that holds the items', () => {
        // A consumer's `sx` and `className` style the same box: parent-relative layout (`flex: 1`
        // with `overflowY: 'auto'` in a flex panel) needs the root, and `& > div` needs the items.
        const { container } = render(
            <SortableList
                items={ITEMS}
                onChange={vi.fn()}
                renderItem={(item): React.JSX.Element => <div>{item.name}</div>}
                className="my-list"
                sx={{ display: 'grid', marginTop: '7px' }}
            />,
        );
        const root = container.querySelector('.my-list') as HTMLElement;

        expect(container.childElementCount).toBe(1);
        expect(container.firstElementChild).toBe(root);
        expect(root.getAttribute('data-testid')).toBe('ring-sortablelist');
        expect(getComputedStyle(root).marginTop).toBe('7px');
        expect(getComputedStyle(root).display).toBe('grid');
        expect(
            Array.from(root.querySelectorAll(':scope > [data-testid^="ring-sortablelist-item-"]'), (node) =>
                node.getAttribute('data-testid'),
            ),
        ).toEqual(ITEMS.map(({ id }) => `ring-sortablelist-item-${id}`));
    });

    describe('items changed by the host during a keyboard drag', () => {
        // jsdom has no layout, and dnd-kit's keyboard coordinates come from rects: stack the item wrappers in
        // 40px rows in DOM order, and measure the drag overlay where the picked item sits.
        const rowRect = (element: Element): DOMRect => {
            if (element.getAttribute('aria-roledescription') === 'sortable') {
                const row = Array.from(element.parentElement?.children ?? []).indexOf(element);

                return new DOMRect(0, row * 40, 200, 40);
            }

            if (element.parentElement?.style.position === 'fixed') {
                const picked = document.querySelector('[aria-roledescription="sortable"][aria-pressed="true"]');

                return picked ? rowRect(picked) : new DOMRect(0, 0, 200, 40);
            }

            return new DOMRect(0, 0, 200, 400);
        };

        beforeEach(() => {
            vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
                return rowRect(this);
            });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        // The KeyboardSensor attaches its keydown listener on a timer after the drag starts.
        const pause = (): Promise<void> => act(() => new Promise<void>((resolve) => setTimeout(resolve, 20)));

        // Picks item 4 up, moves it above 3 and 2 (preview 1,4,2,3,5), lets the host change the items, drops.
        const dragFourUpTwiceWhile = async (
            change: (items: Item[]) => Item[],
        ): Promise<{ onChange: ReturnType<typeof vi.fn>; midDrag: string[] }> => {
            const onChange = vi.fn();
            const list = (items: Item[]): React.JSX.Element => (
                <SortableList
                    items={items}
                    onChange={onChange}
                    renderItem={(item): React.JSX.Element => <div data-item={item.id}>{item.name}</div>}
                />
            );
            const { container, rerender } = render(list(ITEMS));
            const rendered = (): string[] =>
                Array.from(container.querySelectorAll('[data-item]'), (node) => node.getAttribute('data-item') ?? '');
            const handle = container.querySelector('[data-item="4"]')?.closest('[role="button"]') as HTMLElement;

            handle.focus();

            for (const code of ['Space', 'ArrowUp', 'ArrowUp']) {
                fireEvent.keyDown(handle, { code });
                await pause();
            }

            expect(rendered()).toEqual(['1', '4', '2', '3', '5']);

            rerender(list(change(ITEMS)));
            await pause();

            const midDrag = rendered();

            fireEvent.keyDown(handle, { code: 'Space' });
            await pause();

            return { onChange, midDrag };
        };

        const committed = (onChange: ReturnType<typeof vi.fn>): string[][] =>
            onChange.mock.calls.map(([items]) => (items as Item[]).map(({ id }) => id));

        it('Should show an appended item at once and commit the move with it', async () => {
            const added = { id: '6', name: 'Value 6' };
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => [...items, added]);

            expect(midDrag).toEqual(['1', '4', '2', '3', '5', '6']);
            expect(committed(onChange)).toEqual([['1', '4', '2', '3', '5', '6']]);
            expect(onChange.mock.calls[0][0][5]).toBe(added);
        });

        it('Should keep a prepended item first and commit the move after it', async () => {
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => [
                { id: '0', name: 'Value 0' },
                ...items,
            ]);

            expect(midDrag).toEqual(['0', '1', '4', '2', '3', '5']);
            expect(committed(onChange)).toEqual([['0', '1', '4', '2', '3', '5']]);
        });

        it('Should keep an item inserted in a range the dragged item crossed where the host put it', async () => {
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => [
                ...items.slice(0, 2),
                { id: '9', name: 'Value 9' },
                ...items.slice(2),
            ]);

            expect(midDrag).toEqual(['1', '4', '2', '9', '3', '5']);
            expect(committed(onChange)).toEqual([['1', '4', '2', '9', '3', '5']]);
        });

        it('Should keep the order the host gives the other items', async () => {
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => [
                items[0],
                items[2],
                items[1],
                ...items.slice(3),
            ]);

            expect(midDrag).toEqual(['1', '4', '3', '2', '5']);
            expect(committed(onChange)).toEqual([['1', '4', '3', '2', '5']]);
        });

        it('Should drop an item the host removed and commit the move without it', async () => {
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => items.filter(({ id }) => id !== '5'));

            expect(midDrag).toEqual(['1', '4', '2', '3']);
            expect(committed(onChange)).toEqual([['1', '4', '2', '3']]);
        });

        it('Should commit nothing when the host removes the dragged item', async () => {
            const { onChange, midDrag } = await dragFourUpTwiceWhile((items) => items.filter(({ id }) => id !== '4'));

            // It stays under the user's hand until the release.
            expect(midDrag).toEqual(['1', '4', '2', '3', '5']);
            expect(onChange).not.toHaveBeenCalled();
        });

        it('Should commit the current objects when the host only refreshes them', async () => {
            const fresh = ITEMS.map((item) => ({ ...item, name: `${item.name}!` }));
            const { onChange, midDrag } = await dragFourUpTwiceWhile(() => fresh);

            expect(midDrag).toEqual(['1', '4', '2', '3', '5']);
            expect(committed(onChange)).toEqual([['1', '4', '2', '3', '5']]);
            expect(onChange.mock.calls[0][0][1]).toBe(fresh[3]);
        });
    });
});
