import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';

interface Option {
    label: string;
    id: number;
    name?: string;
}

const OPTIONS: Option[] = [
    { label: 'Onet', id: 1, name: 'onet.pl' },
    { label: 'Fakt', id: 2, name: 'fakt.pl' },
    { label: 'Newsweek', id: 3, name: 'newsweek.pl' },
];

describe('Autocomplete - chip rendering', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderMultiple = <Value,>(props: Partial<DefaultAutocompleteProps<Value>>): HTMLElement =>
        render(<Autocomplete<Value> options={[]} labels={{ title: 'Title' }} multiple={true} {...props} />).container;

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    describe('labels', () => {
        it('labels chips with getOptionLabel', () => {
            const container = renderMultiple<Option>({
                options: OPTIONS,
                value: OPTIONS.slice(0, 2),
                getOptionLabel: (option): string => (typeof option === 'string' ? option : (option.name ?? '')),
            });

            expect(chipLabels(container)).toEqual(['onet.pl', 'fakt.pl']);
        });

        it('falls back to the string form of an option that is neither a string nor has a label', () => {
            const container = renderMultiple<number>({ options: [1, 2, 3], value: [1, 22] });

            expect(chipLabels(container)).toEqual(['1', '22']);
        });

        it('names the default chip with its full label through the tooltip', () => {
            const container = renderMultiple<Option>({ options: OPTIONS, value: OPTIONS.slice(0, 2) });
            const chips = Array.from(container.querySelectorAll('.MuiChip-root'));

            expect(chips.map((chip) => chip.getAttribute('aria-label'))).toEqual(['Onet', 'Fakt']);
        });
    });

    describe('renderer precedence', () => {
        it('lets renderValue render the value instead of renderChip and the default chips', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            const renderChip = vi.fn((): React.ReactNode => <i>chip</i>);
            const container = renderMultiple<Option>({
                options: OPTIONS,
                value: OPTIONS,
                renderChip,
                renderValue: (value): React.ReactNode => <b>{`${(value as Option[]).length} selected`}</b>,
            });

            expect(container.querySelector('b')?.textContent).toBe('3 selected');
            expect(renderChip).not.toHaveBeenCalled();
            expect(container.querySelector('.MuiChip-root')).toBeNull();
            expect(warn.mock.calls).toEqual([
                ['Autocomplete: renderChip is ignored because renderValue takes precedence.'],
            ]);
        });

        it('shows a single value in the input and never calls renderChip without multiple', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            const renderChip = vi.fn((): React.ReactNode => <i>chip</i>);
            const { container } = render(
                <Autocomplete<Option>
                    options={OPTIONS}
                    labels={{ title: 'Title' }}
                    value={OPTIONS[0]}
                    renderChip={renderChip}
                />,
            );

            expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Onet');
            expect(renderChip).not.toHaveBeenCalled();
            expect(container.querySelector('.MuiChip-root')).toBeNull();
            expect(warn.mock.calls).toEqual([['Autocomplete: renderChip is ignored because multiple is not enabled.']]);
        });
    });

    describe('delete icon', () => {
        it('falls back to the default glyph when slotProps.chip.deleteIcon is not an element', () => {
            const notAnElement = 'x' as unknown as React.ReactElement;
            const container = renderMultiple<Option>({
                options: OPTIONS,
                value: OPTIONS.slice(0, 1),
                onChange: vi.fn(),
                slotProps: { chip: { deleteIcon: notAnElement } },
            });

            expect(container.querySelectorAll('svg.lucide-x.MuiChip-deleteIcon')).toHaveLength(1);
        });
    });

    describe('limitTags', () => {
        it('cuts the chips of an unfocused field to the limit and counts the rest', () => {
            const container = renderMultiple<Option>({ options: OPTIONS, value: OPTIONS, limitTags: 1 });

            expect(chipLabels(container)).toEqual(['Onet']);
            expect(screen.queryAllByText('+2')).toHaveLength(1);
        });

        it('cuts the chips of renderChip the same way', () => {
            const container = renderMultiple<Option>({
                options: OPTIONS,
                value: OPTIONS,
                limitTags: 2,
                renderChip: ({ label }): React.ReactNode => <em>{label}</em>,
            });

            expect(Array.from(container.querySelectorAll('em')).map((chip) => chip.textContent)).toEqual([
                'Onet',
                'Fakt',
            ]);
            expect(container.textContent).toContain('+1');
        });
    });

    describe('disabled field', () => {
        it('renders its chips disabled', () => {
            const container = renderMultiple<Option>({ options: OPTIONS, value: OPTIONS.slice(0, 2), disabled: true });
            const chips = Array.from(container.querySelectorAll('.MuiChip-root'));

            expect(chips).toHaveLength(2);
            expect(chips.every((chip) => chip.classList.contains('Mui-disabled'))).toBe(true);
        });
    });
});
