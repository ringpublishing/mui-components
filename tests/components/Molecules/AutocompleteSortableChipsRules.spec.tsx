import React, { useState } from 'react';
import { Chip } from '@mui/material';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
    Autocomplete,
    AutocompleteChipRenderContext,
    DefaultAutocompleteProps,
} from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';

interface Option {
    label: string;
    id?: number;
    code?: string;
}

const OPTIONS: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Fakt', id: 2 },
    { label: 'Newsweek', id: 3 },
];

const DUPLICATE_IDENTITY_WARNING =
    'Autocomplete: sortableChips requires unique option identities ' +
    '(getOptionKey, an id field, or unique labels); rendering non-sortable chips.';

describe('Autocomplete - sortable chips rules', () => {
    // jsdom has no `PointerEvent`; dnd-kit's PointerSensor only needs `isPrimary`, `button` and the
    // client coordinates a `MouseEvent` carries.
    class TestPointerEvent extends MouseEvent {
        public readonly isPrimary: boolean;

        public readonly pointerId: number;

        constructor(type: string, init: PointerEventInit = {}) {
            super(type, init);
            this.isPrimary = init.isPrimary ?? true;
            this.pointerId = init.pointerId ?? 1;
        }
    }

    const SLOT = 50;
    let pickedIndex = 0;

    const isChipItem = (element: Element | null): boolean => Boolean(element?.querySelector(':scope > .MuiChip-root'));

    // jsdom has no layout: sortable items sit in 50px slots along the x axis in DOM order, the
    // collection spans them all, and the drag ghost is measured where the picked item sat.
    const rectOf = (element: Element): DOMRect => {
        if ((element.parentElement as HTMLElement | null)?.style.position === 'fixed') {
            return new DOMRect(pickedIndex * SLOT, 0, SLOT, 40);
        }

        if (isChipItem(element)) {
            const items = Array.from(element.parentElement?.children ?? []).filter(isChipItem);

            return new DOMRect(items.indexOf(element) * SLOT, 0, SLOT, 40);
        }

        if (isChipItem(element.firstElementChild)) {
            return new DOMRect(0, 0, Array.from(element.children).filter(isChipItem).length * SLOT, 40);
        }

        return new DOMRect(0, 0, 0, 0);
    };

    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
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

    const point = (index: number, offset = 0): { clientX: number; clientY: number } => ({
        clientX: index * SLOT + SLOT / 2 + offset,
        clientY: 20,
    });

    const chipAt = (container: HTMLElement, index: number): HTMLElement =>
        container.querySelector(`[data-testid="ring-autocomplete-chip-${index}"]`) as HTMLElement;

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    const chipTestIds = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('[data-testid^="ring-autocomplete-chip-"]')).map(
            (chip) => `${chip.getAttribute('data-testid')}:${chip.textContent}`,
        );

    const hasDragContext = (container: HTMLElement): boolean =>
        container.querySelector('[id^="DndLiveRegion"]') !== null;

    /** Holds the chip at `index` past the press delay, then carries it `distance` px along the row. */
    const pickUp = async (container: HTMLElement, index: number, distance: number): Promise<void> => {
        pickedIndex = index;
        fireEvent.pointerDown(chipAt(container, index), { ...point(index), button: 0, isPrimary: true });
        await pause(150);

        const step = Math.sign(distance);

        for (let offset = 0; offset !== distance;) {
            offset += step;
            fireEvent.pointerMove(document.body, point(index, offset));
        }
    };

    const drop = async (index: number, distance: number, settleMs = 600): Promise<void> => {
        fireEvent.pointerUp(document.body, point(index, distance));
        await pause(settleMs);
    };

    /** Drags the first chip one slot to the right and waits for the drop to settle. */
    const dragFirstPastSecond = async (container: HTMLElement): Promise<void> => {
        await pickUp(container, 0, 60);
        await drop(0, 60);
    };

    const labelsOf = (value: unknown): string[] => (value as Option[]).map(({ label }) => label);

    const renderSortable = (
        props: Partial<DefaultAutocompleteProps<Option>> = {},
    ): { container: HTMLElement; rerender: (ui: React.ReactNode) => void } =>
        render(
            <Autocomplete<Option>
                options={OPTIONS}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                {...props}
            />,
        );

    describe('uncontrolled', () => {
        it('shows the new order after a drop, with test ids following the new positions', async () => {
            const { container } = renderSortable({ defaultValue: OPTIONS });

            await dragFirstPastSecond(container);

            expect(chipTestIds(container)).toEqual([
                'ring-autocomplete-chip-0:Fakt',
                'ring-autocomplete-chip-1:Onet',
                'ring-autocomplete-chip-2:Newsweek',
            ]);
        });

        it('keeps an option picked from the list', () => {
            const { container } = renderSortable({ defaultValue: [OPTIONS[0]] });
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'News' } });
            fireEvent.click(screen.getByRole('option', { name: 'Newsweek' }));

            expect(chipLabels(container)).toEqual(['Onet', 'Newsweek']);
        });

        it('stays empty after the clear button', () => {
            const { container } = renderSortable({ defaultValue: OPTIONS });

            fireEvent.click(container.querySelector('.MuiAutocomplete-clearIndicator') as HTMLElement);

            expect(chipLabels(container)).toEqual([]);
        });
    });

    describe('onChange on a drop', () => {
        it('reports the reordered value with the reorder reason and no details', async () => {
            const onChange = vi.fn();
            const { container } = renderSortable({ defaultValue: OPTIONS, onChange });

            await dragFirstPastSecond(container);

            expect(onChange).toHaveBeenCalledTimes(1);

            const call = onChange.mock.calls[0];

            expect(call).toHaveLength(3);
            expect(labelsOf(call[1])).toEqual(['Fakt', 'Onet', 'Newsweek']);
            expect(call[1][1]).toBe(OPTIONS[0]);
            expect(call[2]).toBe('reorder');
        });

        it('passes a stand-in event that points at the element the press landed on and is safe to cancel', async () => {
            const onChange = vi.fn();
            const { container } = renderSortable({ defaultValue: OPTIONS, onChange });
            const pressed = chipAt(container, 0);

            await dragFirstPastSecond(container);

            const event = onChange.mock.calls[0][0] as React.SyntheticEvent;

            expect(event.type).toBe('reorder');
            expect(event.nativeEvent).toBeInstanceOf(TestPointerEvent);
            expect(event.nativeEvent.type).toBe('pointerdown');
            expect(event.target).toBe(pressed);
            expect(event.currentTarget).toBe(pressed);
            expect(event.bubbles).toBe(false);
            expect(event.cancelable).toBe(false);
            expect(event.isTrusted).toBe(false);
            expect(event.defaultPrevented).toBe(false);
            expect((): void => {
                event.preventDefault();
                event.stopPropagation();
                event.persist();
            }).not.toThrow();
            expect(event.isDefaultPrevented()).toBe(false);
            expect(event.isPropagationStopped()).toBe(false);
        });
    });

    describe('controlled', () => {
        it('keeps the value prop on screen when the consumer does not store the new order', async () => {
            const onChange = vi.fn();
            const { container } = renderSortable({ value: OPTIONS, onChange });

            await dragFirstPastSecond(container);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(labelsOf(onChange.mock.calls[0][1])).toEqual(['Fakt', 'Onet', 'Newsweek']);
            expect(chipLabels(container)).toEqual(['Onet', 'Fakt', 'Newsweek']);
        });

        it('shows the new order once the consumer stores it', async () => {
            const Controlled = (): React.JSX.Element => {
                const [value, setValue] = useState<Option[]>(OPTIONS);

                return (
                    <Autocomplete<Option>
                        options={OPTIONS}
                        labels={{ title: 'Title' }}
                        multiple={true}
                        sortableChips={true}
                        value={value}
                        onChange={(event, next): void => setValue(next as Option[])}
                    />
                );
            };

            const { container } = render(<Controlled />);

            await dragFirstPastSecond(container);

            expect(chipLabels(container)).toEqual(['Fakt', 'Onet', 'Newsweek']);
        });
    });

    describe('while a chip is dragged', () => {
        it('tells renderChip that a drag is active and keeps the committed index', async () => {
            const contexts: AutocompleteChipRenderContext<Option>[] = [];
            const { container } = renderSortable({
                defaultValue: OPTIONS,
                renderChip: (context): React.ReactNode => {
                    contexts.push(context);

                    return <Chip {...context.chipProps} />;
                },
            });

            expect(contexts.length).toBeGreaterThan(0);
            expect(contexts.every(({ isDragActive }) => isDragActive === false)).toBe(true);

            contexts.length = 0;
            await pickUp(container, 0, 60);

            // The working copy is already reordered on screen, the value is not committed yet.
            expect(chipLabels(container)).toEqual(['Fakt', 'Onet', 'Newsweek']);

            const latest = new Map(contexts.map((context) => [context.label, context]));

            expect(Array.from(latest.values()).map(({ isDragActive }) => isDragActive)).toEqual([true, true, true]);
            expect(latest.get('Onet')?.index).toBe(0);
            expect(latest.get('Fakt')?.index).toBe(1);
            expect(latest.get('Newsweek')?.index).toBe(2);

            await drop(0, 60);
        });

        it('drops the tooltip of the default chips until the drag ends', async () => {
            const { container } = renderSortable({ defaultValue: OPTIONS });

            expect(chipAt(container, 2).getAttribute('aria-label')).toBe('Newsweek');

            await pickUp(container, 0, 60);

            expect(chipAt(container, 2).getAttribute('aria-label')).toBe('');

            await drop(0, 60);

            expect(chipAt(container, 2).getAttribute('aria-label')).toBe('Newsweek');
        });
    });

    describe('limitTags', () => {
        it('renders every chip, warns that limitTags is ignored and still reorders', async () => {
            const { container } = renderSortable({ defaultValue: OPTIONS, limitTags: 1 });

            expect(chipLabels(container)).toEqual(['Onet', 'Fakt', 'Newsweek']);
            expect(container.textContent).not.toContain('+2');
            expect(warn.mock.calls).toEqual([
                ['Autocomplete: limitTags is ignored because sortableChips renders all chips.'],
            ]);

            await dragFirstPastSecond(container);

            expect(chipLabels(container)).toEqual(['Fakt', 'Onet', 'Newsweek']);
        });

        it('does not warn for the unlimited value of limitTags', () => {
            const { container } = renderSortable({ defaultValue: OPTIONS, limitTags: -1 });

            expect(hasDragContext(container)).toBe(true);
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe('chip identity', () => {
        it('tells options with the same label apart by their id', () => {
            const { container } = renderSortable({
                defaultValue: [
                    { label: 'Same', id: 1 },
                    { label: 'Same', id: 2 },
                ],
            });

            expect(hasDragContext(container)).toBe(true);
            expect(warn).not.toHaveBeenCalled();
        });

        it('tells options with the same id apart by getOptionKey', () => {
            const { container } = renderSortable({
                defaultValue: [
                    { label: 'Onet', id: 7, code: 'a' },
                    { label: 'Fakt', id: 7, code: 'b' },
                ],
                getOptionKey: (option): string => (option as Option).code ?? '',
            });

            expect(hasDragContext(container)).toBe(true);
            expect(warn).not.toHaveBeenCalled();
        });

        it('treats options sharing a getOptionKey as colliding even when their ids differ', () => {
            const { container } = renderSortable({ defaultValue: OPTIONS, getOptionKey: (): string => 'constant' });

            expect(chipLabels(container)).toEqual(['Onet', 'Fakt', 'Newsweek']);
            expect(hasDragContext(container)).toBe(false);
            expect(warn.mock.calls).toEqual([[DUPLICATE_IDENTITY_WARNING]]);
        });

        it('renders static chips and warns once per instance when identities collide', () => {
            const colliding = [{ label: 'Same' }, { label: 'Same' }];
            const { container, rerender } = renderSortable({ value: colliding });

            rerender(
                <Autocomplete<Option>
                    options={OPTIONS}
                    labels={{ title: 'Other title' }}
                    multiple={true}
                    sortableChips={true}
                    value={[...colliding]}
                />,
            );

            expect(chipLabels(container)).toEqual(['Same', 'Same']);
            expect(hasDragContext(container)).toBe(false);
            expect(warn.mock.calls).toEqual([[DUPLICATE_IDENTITY_WARNING]]);

            renderSortable({ value: colliding });

            expect(warn.mock.calls).toEqual([[DUPLICATE_IDENTITY_WARNING], [DUPLICATE_IDENTITY_WARNING]]);
        });
    });

    describe('when another renderer owns the value', () => {
        it('mounts no drag context under renderValue and warns that sortableChips is ignored', () => {
            const { container } = renderSortable({
                value: OPTIONS,
                renderValue: (value): React.ReactNode => <span>{`${(value as Option[]).length} selected`}</span>,
            });

            expect(container.textContent).toContain('3 selected');
            expect(hasDragContext(container)).toBe(false);
            expect(warn.mock.calls).toEqual([
                ['Autocomplete: sortableChips is ignored because renderValue takes precedence.'],
            ]);
        });
    });
});
