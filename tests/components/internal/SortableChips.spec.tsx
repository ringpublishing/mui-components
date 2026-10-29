import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { Box, Chip, Portal } from '@mui/material';
import { act, fireEvent, render, screen } from '../../test-utils/customRenderer.js';
import {
    describeAbortedReorder,
    describeItemPosition,
    dropKeyframes,
    fadeShadow,
    GHOST_TILT,
    ghostKeyframes,
    moveIntoItems,
    reorderById,
    resolveDropTransform,
    settle,
    SortableChips,
} from '../../../src/components/internal/SortableChips.js';
import { findItemSurface } from '../../../src/components/internal/SortableItem.js';

interface Item {
    id: string;
    label: string;
}

/** `theme.shadows[4]` as a browser reports it from `getComputedStyle` — colour first, three layers. */
const MUI_SHADOW_4 =
    'rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px';

const ITEMS: Item[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
];

describe('Components: internal/SortableChips', () => {
    describe('reorderById (drag reorder logic)', () => {
        it('moves the dragged item to the position of the item it was dropped over', () => {
            const result = reorderById(ITEMS, 'a', 'c');

            expect(result.map(({ id }) => id)).toEqual(['b', 'c', 'a']);
        });

        it('returns a new array without mutating the original', () => {
            const result = reorderById(ITEMS, 'a', 'b');

            expect(result).not.toBe(ITEMS);
            expect(ITEMS.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
        });

        it('returns the same reference when active and over are equal (no-op)', () => {
            expect(reorderById(ITEMS, 'b', 'b')).toBe(ITEMS);
        });

        it('returns the same reference when an id is not found', () => {
            expect(reorderById(ITEMS, 'a', 'missing')).toBe(ITEMS);
        });
    });

    describe('rendering', () => {
        it('renders every item through renderChip in each direction', () => {
            for (const direction of ['wrap', 'vertical', 'horizontal'] as const) {
                const { getByText, unmount } = render(
                    <SortableChips
                        items={ITEMS}
                        onChange={vi.fn()}
                        direction={direction}
                        renderChip={(item): React.ReactNode => <Chip label={`${item.label}-${direction}`} />}
                    />,
                );

                for (const item of ITEMS) {
                    expect(getByText(`${item.label}-${direction}`)).toBeTruthy();
                }

                unmount();
            }
        });

        it('does not call onChange on mount', () => {
            const onChange = vi.fn();

            render(
                <SortableChips
                    items={ITEMS}
                    onChange={onChange}
                    renderChip={(item): React.ReactNode => <Chip label={item.label} />}
                />,
            );

            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('prop sync', () => {
        // A child COMPONENT, not a counter inside `renderChip`: a render-phase state update makes
        // React discard the in-progress pass and re-invoke SortableChips, so `renderChip` itself is
        // called twice per committed render while its children are reconciled exactly once. Only
        // the committed count is the work this fix is about.
        function Probe({ onRender, label }: { onRender: () => void; label: string }): React.JSX.Element {
            onRender();

            return <Chip label={label} />;
        }

        const renderHost = (
            onRender: () => void,
            items: Item[] = ITEMS,
        ): ReturnType<typeof render> & { setItems: (next: Item[]) => void } => {
            let current = items;
            const Host = (): React.JSX.Element => (
                <SortableChips
                    // Fresh array of fresh objects on every render, exactly like Autocomplete's
                    // `renderSortableValue`.
                    items={current.map((item) => ({ ...item }))}
                    onChange={vi.fn()}
                    renderChip={(item): React.ReactNode => <Probe onRender={onRender} label={item.label} />}
                />
            );
            const utils = render(<Host />);

            return {
                ...utils,
                setItems: (next: Item[]): void => {
                    current = next;
                    utils.rerender(<Host />);
                },
            };
        };

        it('commits one render of the chip subtree per parent render when the items identity churns', () => {
            const onRender = vi.fn();
            const { setItems } = renderHost(onRender);

            onRender.mockClear();
            setItems(ITEMS);

            expect(onRender).toHaveBeenCalledTimes(ITEMS.length);
        });

        it('renders the current item objects after a same-order content change', () => {
            // Regression lock: a guard that skipped the sync while the id order matched would strand
            // the previous render's chip objects (and their `onDelete` closures).
            const { setItems, queryByText } = renderHost(vi.fn());

            setItems([
                { id: 'a', label: 'A renamed' },
                { id: 'b', label: 'B' },
                { id: 'c', label: 'C' },
            ]);

            expect(queryByText('A renamed')).toBeTruthy();
            expect(queryByText('A')).toBeNull();
        });

        it('adopts an externally added chip in the same commit', () => {
            const onRender = vi.fn();
            const { setItems, queryByText } = renderHost(onRender);

            onRender.mockClear();
            setItems([...ITEMS, { id: 'd', label: 'D' }]);

            expect(queryByText('D')).toBeTruthy();
            expect(onRender).toHaveBeenCalledTimes(4);
        });
    });

    describe('drop animation', () => {
        const NO_SCALE = { scaleX: 1, scaleY: 1 };

        it('lands the ghost exactly on the slot the in-list item occupies', () => {
            const final = resolveDropTransform(
                { x: 180, y: 160, ...NO_SCALE },
                { left: 300, top: 200 },
                { left: 120, top: 40 },
            );

            expect(final).toEqual({ x: 0, y: 0, ...NO_SCALE });
        });

        it('measures against the overlay wrapper, so a rotated (inflated) rect cannot skew it', () => {
            // dnd-kit measures `dragOverlay.node.children[0]` — here the −2°-tilted ghost — whose
            // bounding box is bigger and higher than the wrapper's. Feeding that inflated rect in
            // moves the landing point, which is exactly the drift this helper exists to avoid.
            const wrapper = resolveDropTransform(
                { x: 180, y: 160, ...NO_SCALE },
                { left: 300, top: 200 },
                { left: 120, top: 40 },
            );
            const rotated = resolveDropTransform(
                { x: 180, y: 160, ...NO_SCALE },
                { left: 299.45, top: 197.9 },
                { left: 120, top: 40 },
            );

            expect(rotated).not.toEqual(wrapper);
        });

        it('keeps the transform scale untouched', () => {
            const final = resolveDropTransform(
                { x: 10, y: 10, scaleX: 0.5, scaleY: 2 },
                { left: 10, top: 10 },
                { left: 10, top: 10 },
            );

            expect(final).toEqual({ x: 10, y: 10, scaleX: 0.5, scaleY: 2 });
        });

        it('builds two distinct translate keyframes', () => {
            const frames = dropKeyframes({ x: 180, y: 160, ...NO_SCALE }, { x: 0, y: 0, ...NO_SCALE });

            expect(frames).toHaveLength(2);
            expect(frames[0].transform).toContain('translate3d(180px, 160px, 0)');
            expect(frames[1].transform).toContain('translate3d(0px, 0px, 0)');
            // A single-frame (or identical-frame) animation is a silent no-op in dnd-kit, which
            // bails out when the first and last keyframes match.
            expect(frames[0].transform).not.toEqual(frames[1].transform);
        });

        it('untilts the ghost from the lift angle back to zero', () => {
            const frames = ghostKeyframes(MUI_SHADOW_4);

            expect(frames).toHaveLength(2);
            expect(frames[0].transform).toBe(GHOST_TILT);
            expect(frames[1].transform).toBe('rotate(0deg)');
        });

        it('fades the lift shadow out over the same flight', () => {
            const frames = ghostKeyframes(MUI_SHADOW_4);

            expect(frames[0].boxShadow).toBe(MUI_SHADOW_4);
            expect(frames[1].boxShadow).toBe(
                'rgba(0, 0, 0, 0) 0px 2px 4px -1px, rgba(0, 0, 0, 0) 0px 4px 5px 0px, rgba(0, 0, 0, 0) 0px 1px 10px 0px',
            );
        });

        it('dims in place — same layers, same offsets, alpha only', () => {
            const landed = fadeShadow(MUI_SHADOW_4);

            // Fading towards `none` or a zero-length layer also takes the offsets and the blur to
            // 0, so the shadow shrinks inward ahead of the card. Alpha-only keeps its geometry
            // under the card until it lands, and keeps the two shadow lists the same length.
            expect(landed?.split('px,').length).toBe(MUI_SHADOW_4.split('px,').length);
            expect(landed).toContain('0px 2px 4px -1px');
            expect(landed).toContain('0px 4px 5px 0px');
            expect(landed).toContain('0px 1px 10px 0px');
            expect(landed).not.toContain('none');
        });

        it('leaves the ghost un-animated when the computed shadow carries no colour', () => {
            expect(fadeShadow('none')).toBeNull();
            expect(fadeShadow('')).toBeNull();

            const frames = ghostKeyframes('none');

            expect(frames).toHaveLength(2);
            expect(frames[0].boxShadow).toBeUndefined();
            expect(frames[1].boxShadow).toBeUndefined();
        });

        describe('settle', () => {
            it('resolves when the animation finishes', async () => {
                await expect(settle(Promise.resolve('done'), 1000)).resolves.toBeUndefined();
            });

            it('resolves — never rejects — when the animation is cancelled', async () => {
                const aborted = Promise.reject(new DOMException('The user aborted a request.', 'AbortError'));

                await expect(settle(aborted, 1000)).resolves.toBeUndefined();
            });

            it('resolves on the timer when the animation never settles', async () => {
                vi.useFakeTimers();

                try {
                    const pending = settle(new Promise(() => undefined), 300);
                    let settled = false;

                    void pending.then(() => {
                        settled = true;
                    });

                    await vi.advanceTimersByTimeAsync(299);
                    expect(settled).toBe(false);

                    await vi.advanceTimersByTimeAsync(2);
                    expect(settled).toBe(true);
                } finally {
                    vi.useRealTimers();
                }
            });
        });
    });

    describe('accessibility', () => {
        it('announces a name and a position when the host can resolve a label', () => {
            expect(describeItemPosition(ITEMS, 'b', (item) => item.label)).toBe('B, position 2 of 3');
        });

        it('falls back to the position alone without a label resolver', () => {
            expect(describeItemPosition(ITEMS, 'c')).toBe('position 3 of 3');
        });

        it('does not invent a position for an unknown id', () => {
            // `undefined`, not "position 0 of 3": dnd-kit's `announce` ignores `undefined`, so the
            // live region keeps whatever it last said instead of reading out a position that does
            // not exist.
            expect(describeItemPosition(ITEMS, 'missing')).toBeUndefined();
        });

        it('says an aborted drag put the item back, with its name when the host resolves one', () => {
            expect(describeAbortedReorder(ITEMS, 'c', (item) => item.label)).toBe(
                'Reorder cancelled. C is back at position 3 of 3.',
            );
        });

        it('starts every sentence of an aborted drag with a capital, with no label to lead on', () => {
            // Regression lock for "Reorder cancelled. position 3 of 3." — a lower-case fragment
            // where a second sentence belongs.
            expect(describeAbortedReorder(ITEMS, 'c')).toBe('Reorder cancelled. Back at position 3 of 3.');
        });

        it('states only the cancellation when the item is no longer in the list', () => {
            expect(describeAbortedReorder(ITEMS, 'missing')).toBe('Reorder cancelled.');
        });

        it('does not promise a keyboard drag when no KeyboardSensor is mounted', () => {
            const { container } = render(
                <SortableChips
                    items={ITEMS}
                    onChange={vi.fn()}
                    renderChip={(item): React.ReactNode => <Chip label={item.label} />}
                />,
            );

            expect(container.textContent).not.toContain('space bar');
        });

        it('describes the keyboard drag when the KeyboardSensor is mounted', () => {
            const { container } = render(
                <SortableChips
                    items={ITEMS}
                    onChange={vi.fn()}
                    keyboardSorting={true}
                    direction="vertical"
                    renderChip={(item): React.ReactNode => <Chip label={item.label} />}
                />,
            );

            expect(container.textContent).toContain('space bar');
        });
    });

    describe('pointer drag', () => {
        // jsdom has no `PointerEvent`; dnd-kit's PointerSensor needs no trusted events, only `isPrimary`,
        // `button` and the client coordinates a `MouseEvent` carries.
        class TestPointerEvent extends MouseEvent {
            public readonly isPrimary: boolean;

            public readonly pointerId: number;

            constructor(type: string, init: PointerEventInit = {}) {
                super(type, init);
                this.isPrimary = init.isPrimary ?? true;
                this.pointerId = init.pointerId ?? 1;
            }
        }

        type Direction = 'vertical' | 'horizontal' | 'wrap';

        const DIRECTIONS: Direction[] = ['vertical', 'horizontal', 'wrap'];
        const SIZE = 50;
        const SURFACE_WIDTH = 37.5;
        let mainAxis: 'x' | 'y' = 'y';
        let pickedIndex = 0;

        const slot = (index: number, count = 1): DOMRect =>
            mainAxis === 'y'
                ? new DOMRect(0, index * SIZE, 200, count * SIZE)
                : new DOMRect(index * SIZE, 0, count * SIZE, 40);

        // jsdom has no layout: items sit in 50px slots along the main axis in DOM order, the collection spans
        // them all, and the ghost is measured where the picked item sat.
        const rectOf = (element: Element): DOMRect => {
            const testId = element.getAttribute('data-testid');

            if (testId === 'scroller') {
                // Large enough that the ghost never reaches dnd-kit's auto-scroll edge zones.
                return new DOMRect(-1000, -1000, 3000, 3000);
            }

            if (testId?.startsWith('item-')) {
                return slot(Array.from(element.parentElement?.children ?? []).indexOf(element));
            }

            if (element.firstElementChild?.getAttribute('data-testid')?.startsWith('item-')) {
                // dnd-kit's hidden instructions and live region follow the items in the same element.
                const items = Array.from(element.children).filter((child) =>
                    child.getAttribute('data-testid')?.startsWith('item-'),
                );

                return slot(0, items.length);
            }

            if (testId?.startsWith('surface-')) {
                return new DOMRect(0, 0, SURFACE_WIDTH, 24);
            }

            if ((element.parentElement as HTMLElement | null)?.style.position === 'fixed') {
                return slot(pickedIndex);
            }

            return new DOMRect(0, 0, 0, 0);
        };

        beforeEach(() => {
            vi.stubGlobal('PointerEvent', TestPointerEvent);
            vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
                return rectOf(this);
            });
        });

        afterEach(() => {
            vi.unstubAllGlobals();
            vi.restoreAllMocks();
        });

        const pause = (ms: number): Promise<void> => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

        /** Client coordinates `offset` px along the main axis from the centre of slot `index`. */
        const point = (index: number, offset = 0): { clientX: number; clientY: number } => {
            const centre = index * SIZE + SIZE / 2 + offset;

            return mainAxis === 'y' ? { clientX: 100, clientY: centre } : { clientX: centre, clientY: 20 };
        };

        const renderChips = (
            direction: Direction,
            renderChip: (item: Item, index: number, isDragActive: boolean) => React.ReactNode = (
                item,
            ): React.ReactNode => <div>{item.label}</div>,
            wrapper: (ui: React.JSX.Element) => React.JSX.Element = (ui): React.JSX.Element => ui,
        ): { onChange: ReturnType<typeof vi.fn>; order: () => string[]; item: (id: string) => HTMLElement } => {
            mainAxis = direction === 'vertical' ? 'y' : 'x';

            const onChange = vi.fn();
            const { container, getByTestId } = render(
                wrapper(
                    <SortableChips
                        items={ITEMS}
                        onChange={onChange}
                        direction={direction}
                        getItemDataTestId={(item): string => `item-${item.id}`}
                        renderChip={renderChip}
                    />,
                ),
            );
            const order = (): string[] =>
                Array.from(container.querySelectorAll('[data-testid^="item-"]'), (node) =>
                    (node.getAttribute('data-testid') ?? '').slice('item-'.length),
                );

            return { onChange, order, item: getByTestId };
        };

        /** `wrap` picks a chip up after a 125ms press, the lists after 5px of travel. */
        const press = async (
            direction: Direction,
            target: Element,
            index: number,
            init: PointerEventInit = {},
        ): Promise<void> => {
            pickedIndex = index;
            fireEvent.pointerDown(target, { ...point(index), button: 0, isPrimary: true, ...init });
            await pause(direction === 'wrap' ? 150 : 0);
        };

        /** Moves the pointer 1px at a time from `from` to `to` px off the centre of slot `index`. */
        const glide = (index: number, from: number, to: number): void => {
            const step = Math.sign(to - from);

            for (let offset = from; offset !== to;) {
                offset += step;
                fireEvent.pointerMove(document.body, point(index, offset));
            }
        };

        const committed = (onChange: ReturnType<typeof vi.fn>): string[][] =>
            onChange.mock.calls.map(([items]) => (items as Item[]).map(({ id }) => id));

        it.each(DIRECTIONS)(
            'commits nothing after an item is dragged past its neighbour and back (%s)',
            async (direction) => {
                const { onChange, order, item } = renderChips(direction);

                await press(direction, item('item-a'), 0);
                glide(0, 0, 30);

                expect(order()).toEqual(['b', 'a', 'c']);

                glide(0, 30, 0);

                const shown = order();

                fireEvent.pointerUp(document.body, point(0));

                expect(committed(onChange)).toEqual([]);
                expect(shown).toEqual(['a', 'b', 'c']);
            },
        );

        it('commits a drop inside the collection after the drag scrolled it', async () => {
            const { onChange, order, item } = renderChips('vertical', undefined, (ui) => (
                <div data-testid="scroller" style={{ overflow: 'auto' }}>
                    {ui}
                </div>
            ));
            const scroller = item('scroller');

            await press('vertical', item('item-a'), 0);
            glide(0, 0, 60);

            // The list scrolls under the pointer, which stays inside it.
            Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 500 });
            fireEvent.scroll(scroller);
            glide(0, 60, 62);

            const shown = order();

            fireEvent.pointerUp(document.body, point(0, 62));

            expect(shown).not.toEqual(['a', 'b', 'c']);
            expect(committed(onChange)).toEqual([shown]);
        });

        it('cancels a drag released more than 32px clear of the collection', async () => {
            const { onChange, order, item } = renderChips('vertical');

            await press('vertical', item('item-a'), 0);
            // The collection ends at 150px: the release point is 75px below it.
            glide(0, 0, 200);
            fireEvent.pointerUp(document.body, point(0, 200));

            expect(committed(onChange)).toEqual([]);
            expect(order()).toEqual(['a', 'b', 'c']);
        });

        it.each(DIRECTIONS)('keeps a held press in portalled content of an item a click (%s)', async (direction) => {
            const onAction = vi.fn();

            renderChips(direction, (item) => (
                <div>
                    {item.label}
                    {item.id === 'a' ? (
                        <Portal>
                            <button type="button" onClick={onAction}>
                                Action
                            </button>
                        </Portal>
                    ) : null}
                </div>
            ));

            const action = screen.getByRole('button', { name: 'Action' });

            fireEvent.pointerDown(action, { clientX: 500, clientY: 500, button: 0, isPrimary: true });
            await pause(200);
            fireEvent.pointerUp(action, { clientX: 500, clientY: 500 });
            fireEvent.click(action);

            expect(onAction).toHaveBeenCalledTimes(1);
        });

        it('draws the drop slot and the ghost in the shape of a chip inside an anchor element', async () => {
            // The `renderChip` + `ActionBox` pattern: the chip sits in a wrapper that draws nothing.
            const { item } = renderChips('wrap', (chip) => (
                <Box sx={{ display: 'inline-flex' }}>
                    <Chip data-testid={`surface-${chip.id}`} label={chip.label} />
                </Box>
            ));

            await press('wrap', item('item-a'), 0);
            glide(0, 0, 3);

            // The slot is drawn on the chip, positioned for its indicator to fill it, not on the wrapper around the
            // chip's margins.
            const [inList, inGhost] = screen.getAllByTestId('surface-a');

            expect(getComputedStyle(inList).position).toBe('relative');

            // The ghost is no wider than the chip in the list and takes its radius instead of a pill's …
            const ghost = inGhost.parentElement?.parentElement as HTMLElement;

            expect(ghost.parentElement?.style.position).toBe('fixed');
            expect(ghost.style.maxWidth).toBe(`${SURFACE_WIDTH}px`);
            expect(ghost.style.borderRadius).toBe(getComputedStyle(inList).borderRadius);
            // … and its content, which the pointer stays on, does not take the hover look.
            expect(getComputedStyle(inGhost).pointerEvents).toBe('none');

            fireEvent.pointerUp(document.body, point(0, 3));
        });

        it.each(DIRECTIONS)('does not pick an item up with a secondary-button press (%s)', async (direction) => {
            const renderChip = vi.fn((item: Item, index: number, isDragActive: boolean): React.ReactNode => (
                <div data-drag-active={isDragActive}>{item.label}</div>
            ));
            const { onChange, item } = renderChips(direction, renderChip);

            await press(direction, item('item-a'), 0, { button: 2 });
            glide(0, 0, 30);
            fireEvent.pointerUp(document.body, point(0, 30));

            expect(renderChip.mock.calls.some(([, , isDragActive]) => isDragActive === true)).toBe(false);
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    // jsdom implements no `Element.prototype.animate`, so the drop animation's timing cannot run here; its
    // geometry is covered by the pure helpers above, and the `typeof node.animate !== 'function'` guard in
    // `SortableChips` settles the drop at once in that case.
});

describe('findItemSurface', () => {
    const renderItem = (content: React.JSX.Element): HTMLElement =>
        render(<div data-testid="item">{content}</div>).getByTestId('item');

    it('returns the child of the item when it draws a box of its own', () => {
        const item = renderItem(<Chip label="A" />);
        const found = findItemSurface(item);

        expect(found?.surface).toBe(item.firstElementChild);
        expect(found?.depth).toBe(0);
    });

    it('looks past wrappers that draw nothing to the chip they hold', () => {
        const item = renderItem(
            <Box sx={{ display: 'inline-flex' }}>
                <div>
                    <Chip label="A" />
                </div>
            </Box>,
        );

        const found = findItemSurface(item);

        expect(found?.surface).toBe(item.querySelector('.MuiChip-root'));
        expect(found?.depth).toBe(2);
    });

    it('finds no surface when the item renders several elements side by side', () => {
        const item = renderItem(
            <>
                <Chip label="A" />
                <Chip label="B" />
            </>,
        );

        expect(findItemSurface(item)).toBeNull();
    });

    it('finds no surface when nothing in the item draws a box', () => {
        expect(findItemSurface(renderItem(<span>A</span>))).toBeNull();
    });
});

describe('moveIntoItems', () => {
    const item = (id: string): { id: string } => ({ id });
    const ids = (list: { id: string }[]): string[] => list.map(({ id }) => id);

    it('places the dragged item after its nearest predecessor that is still there', () => {
        const working = ['a', 'd', 'b', 'c'].map(item);

        expect(ids(moveIntoItems(working, ['a', 'b', 'x', 'c', 'd'].map(item), 'd'))).toEqual([
            'a',
            'd',
            'b',
            'x',
            'c',
        ]);
        expect(ids(moveIntoItems(working, ['b', 'c', 'd'].map(item), 'd'))).toEqual(['d', 'b', 'c']);
    });

    it('keeps the dragged item first when nothing precedes it', () => {
        expect(ids(moveIntoItems(['d', 'a', 'b'].map(item), ['x', 'a', 'b', 'd'].map(item), 'd'))).toEqual([
            'd',
            'x',
            'a',
            'b',
        ]);
    });

    it('keeps a dragged item the items no longer have, and returns the current objects', () => {
        const current = ['a', 'b'].map(item);
        const result = moveIntoItems(['a', 'd', 'b'].map(item), current, 'd');

        expect(ids(result)).toEqual(['a', 'd', 'b']);
        expect(result[0]).toBe(current[0]);
    });

    it('returns the items when the dragged item is not in the working copy', () => {
        const current = ['a', 'b'].map(item);

        expect(moveIntoItems(['a', 'b'].map(item), current, 'z')).toBe(current);
    });
});
