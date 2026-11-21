import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

type Props = Partial<DefaultAutocompleteProps<Option>>;

describe('Autocomplete - slots, refs and root props', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];

    const setup = (props: Props = {}): ReturnType<typeof render> & { input: HTMLInputElement; root: HTMLElement } => {
        const utils = render(
            <Autocomplete<Option>
                options={options}
                labels={{ title: 'Publication', inputPlaceholder: 'Pick a publication' }}
                {...props}
            />,
        );

        return {
            ...utils,
            input: utils.getByRole('combobox') as HTMLInputElement,
            root: utils.getByTestId('ring-autocomplete'),
        };
    };

    /**
     * The declarations the root's own style rule sets on the Clear button. Read from the style sheet, because
     * jsdom does not weigh selectors against each other when it computes a style.
     */
    const clearButtonRule = (root: HTMLElement): CSSStyleDeclaration | undefined => {
        const selectors = Array.from(root.classList).map((name) => `.${name} .MuiAutocomplete-clearIndicator`);

        return Array.from(document.styleSheets)
            .flatMap((sheet) => Array.from(sheet.cssRules))
            .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
            .find((rule) => selectors.includes(rule.selectorText))?.style;
    };

    describe('root element', () => {
        it('is what an object ref points at', () => {
            const ref = React.createRef<HTMLDivElement>();
            const { root } = setup({ ref } as Props);

            expect(ref.current).toBe(root);
        });

        it('is what a callback ref receives', () => {
            const ref = vi.fn();
            const { root } = setup({ ref } as Props);

            expect(ref).toHaveBeenCalledWith(root);
        });

        it('carries the class of the component next to the className of the consumer', () => {
            const { root } = setup({ className: 'publication-field' });

            expect(root.classList.contains('ring-autocomplete')).toBe(true);
            expect(root.classList.contains('publication-field')).toBe(true);
        });

        it('takes the sx of the consumer, which overrides the styles of the component key by key', () => {
            const { root } = setup({
                defaultValue: options[0],
                sx: { maxWidth: '321px', '& .MuiAutocomplete-clearIndicator': { padding: '7px' } },
            });

            expect(getComputedStyle(root).maxWidth).toBe('321px');
            expect(clearButtonRule(root)?.padding).toBe('7px');
        });

        it('keeps its own clear button padding next to an unrelated sx', () => {
            const { root } = setup({ defaultValue: options[0], sx: { maxWidth: '321px' } });

            expect(clearButtonRule(root)?.padding).toBe('2px');
        });
    });

    describe('icons and placeholder', () => {
        it('uses the popupIcon of the consumer', () => {
            const { getByRole } = setup({ popupIcon: <span data-testid="custom-popup" /> });

            expect(getByRole('button', { name: 'Open' }).querySelector('[data-testid="custom-popup"]')).not.toBeNull();
        });

        it('shows the placeholder only while no chips are selected', () => {
            const empty = setup({ multiple: true } as Props);

            expect(empty.input.placeholder).toBe('Pick a publication');
            empty.unmount();

            const withChips = setup({ multiple: true, defaultValue: [options[0]] } as Props);

            expect(withChips.input.placeholder).toBe('');
        });
    });

    describe('slotProps of MUI slots', () => {
        it('reach the popper, the Clear button and the popup button', () => {
            const { getByRole, getByTitle } = setup({
                defaultValue: options[0],
                open: true,
                slotProps: {
                    popper: { className: 'caller-popper' },
                    clearIndicator: { className: 'caller-clear' },
                    popupIndicator: { className: 'caller-popup' },
                },
            });

            expect(getByRole('listbox').closest('.MuiAutocomplete-popper')?.classList.contains('caller-popper')).toBe(
                true,
            );
            expect(getByTitle('Clear').classList.contains('caller-clear')).toBe(true);
            expect(getByRole('button', { name: 'Close' }).classList.contains('caller-popup')).toBe(true);
        });

        it('pass an object slotProps.listbox on, with an object ref pointing at the listbox', () => {
            const ref = React.createRef<HTMLUListElement>();
            const { getByRole } = setup({ open: true, slotProps: { listbox: { ref, className: 'caller-listbox' } } });
            const listbox = getByRole('listbox');

            expect(ref.current).toBe(listbox);
            expect(listbox.classList.contains('caller-listbox')).toBe(true);
        });

        it('hand the listbox to a callback ref in slotProps.listbox', () => {
            const ref = vi.fn();
            const { getByRole } = setup({ open: true, slotProps: { listbox: { ref } } });

            expect(ref).toHaveBeenCalledWith(getByRole('listbox'));
        });

        it('call a slotProps.listbox function and use its props and ref', () => {
            const ref = React.createRef<HTMLUListElement>();
            const { getByRole } = setup({
                open: true,
                slotProps: { listbox: () => ({ ref, className: 'caller-listbox' }) },
            });
            const listbox = getByRole('listbox');

            expect(ref.current).toBe(listbox);
            expect(listbox.classList.contains('caller-listbox')).toBe(true);
        });
    });

    describe('slotProps.textField', () => {
        it('passes its own props to the field', () => {
            const { getByTestId } = setup({ slotProps: { textField: { className: 'caller-field' } } });

            expect(getByTestId('ring-autocomplete-textfield').classList.contains('caller-field')).toBe(true);
        });

        it('cannot replace the label, the placeholder or what MUI wires onto the field', () => {
            const { input, container } = setup({
                slotProps: {
                    textField: {
                        label: 'Caller label',
                        placeholder: 'Caller placeholder',
                        id: 'caller-id',
                        disabled: true,
                    },
                },
            });

            const label = container.querySelector('label') as HTMLLabelElement;

            expect(label.textContent).toBe('Publication');
            expect(label.htmlFor).toBe(input.id);
            expect(label.id).toBe(`${input.id}-label`);
            expect(label.classList.contains('Mui-disabled')).toBe(false);
            expect(input.placeholder).toBe('Pick a publication');
            expect(input.id).not.toBe('caller-id');
            expect(input.disabled).toBe(false);
        });

        it('merges slotProps.input under the input props of the component', () => {
            const { input, container, queryByRole, queryByText } = setup({
                slotProps: {
                    textField: {
                        slotProps: {
                            input: {
                                title: 'Caller input',
                                className: 'caller-input',
                                endAdornment: <span>Caller adornment</span>,
                            },
                        },
                    },
                },
            });

            expect(container.querySelector('.MuiInputBase-root')?.getAttribute('title')).toBe('Caller input');
            expect(queryByText('Caller adornment')).toBeNull();
            expect(queryByRole('button', { name: 'Open' })).not.toBeNull();
            expect(input.closest('.MuiAutocomplete-inputRoot')).not.toBeNull();
            expect(container.querySelector('.caller-input')).toBeNull();
        });
    });
});
