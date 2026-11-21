import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

type Props = Partial<DefaultAutocompleteProps<Option>>;

describe('Autocomplete - value and input text', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];

    const setup = (
        props: Props = {},
    ): ReturnType<typeof render> & { input: HTMLInputElement; optionTexts: () => (string | null)[] } => {
        const utils = render(<Autocomplete<Option> options={options} labels={{ title: 'Publication' }} {...props} />);

        return {
            ...utils,
            input: utils.getByRole('combobox') as HTMLInputElement,
            optionTexts: (): (string | null)[] => utils.getAllByRole('option').map((option) => option.textContent),
        };
    };

    const argumentsOf = (callback: ReturnType<typeof vi.fn>): unknown[][] =>
        callback.mock.calls.map(([event, ...rest]) => [(event as React.SyntheticEvent | null)?.type ?? null, ...rest]);

    describe('onChange', () => {
        it('reports a picked option with the selectOption reason and the option in the details', () => {
            const onChange = vi.fn();
            const { input, getByRole } = setup({ onChange });

            fireEvent.mouseDown(input);
            fireEvent.click(getByRole('option', { name: 'Fakt' }));

            expect(argumentsOf(onChange)).toEqual([['click', options[1], 'selectOption', { option: options[1] }]]);
        });

        it('reports a cleared value with the clear reason and no details', () => {
            const onChange = vi.fn();
            const { getByTitle } = setup({ onChange, defaultValue: options[0] });

            fireEvent.click(getByTitle('Clear'));

            expect(argumentsOf(onChange)).toEqual([['click', null, 'clear', undefined]]);
        });

        it('reports a typed freeSolo entry with the createOption reason', () => {
            const onChange = vi.fn();
            const { input } = setup({ onChange, freeSolo: true } as Props);

            fireEvent.change(input, { target: { value: 'Newsweek' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(argumentsOf(onChange)).toEqual([['keydown', 'Newsweek', 'createOption', { option: 'Newsweek' }]]);
        });
    });

    describe('onInputChange', () => {
        it('reports typing, a pick and a clear, each with its reason', () => {
            const onInputChange = vi.fn();
            const { input, getByRole, getByTitle } = setup({ onInputChange });

            // MUI resets the text of a field that is not focused.
            act(() => input.focus());
            onInputChange.mockClear();
            fireEvent.change(input, { target: { value: 'Fa' } });

            expect(argumentsOf(onInputChange)).toEqual([['change', 'Fa', 'input']]);

            fireEvent.click(getByRole('option', { name: 'Fakt' }));

            expect(argumentsOf(onInputChange).slice(1)).toEqual([['click', 'Fakt', 'selectOption']]);

            fireEvent.click(getByTitle('Clear'));

            expect(argumentsOf(onInputChange).slice(2)).toEqual([['click', '', 'clear']]);
        });
    });

    describe('inputValue', () => {
        it('is the text of the field, and what the options are filtered by, whatever the user types', () => {
            const onInputChange = vi.fn();
            const { input, optionTexts } = setup({ inputValue: 'On', onInputChange, open: true });

            expect(input.value).toBe('On');
            expect(optionTexts()).toEqual(['Onet']);

            act(() => input.focus());
            onInputChange.mockClear();
            fireEvent.change(input, { target: { value: 'Fakt' } });

            expect(argumentsOf(onInputChange)).toEqual([['change', 'Fakt', 'input']]);
            expect(input.value).toBe('On');
            expect(optionTexts()).toEqual(['Onet']);
        });
    });

    describe('text of an option', () => {
        it('comes from getOptionLabel when the consumer passes one', () => {
            const { input, optionTexts } = setup({
                defaultValue: options[1],
                getOptionLabel: (option): string => (typeof option === 'string' ? option : `#${option.id}`),
                open: true,
            });

            expect(input.value).toBe('#2');
            expect(optionTexts()).toEqual(['#1', '#2']);
        });

        it('is the option turned into a string when it is neither a string nor an object', () => {
            const { getByRole, getAllByRole } = render(
                <Autocomplete<number>
                    options={[2024, 2025]}
                    labels={{ title: 'Year' }}
                    defaultValue={2025}
                    open={true}
                />,
            );

            expect((getByRole('combobox') as HTMLInputElement).value).toBe('2025');
            expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['2024', '2025']);
        });
    });
});
