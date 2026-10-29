import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { Autocomplete, AutocompleteProps } from '../../../src/index.js';

/**
 * `slotProps.textField` is spread onto the inner TextField, whose own `slotProps` the component sets for MUI's
 * wiring. The caller's slot props have to be merged into those, not replaced by them — and MUI's label `id` /
 * `htmlFor` have to survive a caller's label props.
 */
describe('Autocomplete - slotProps.textField reaches the field', () => {
    const setup = (
        slotProps: AutocompleteProps<string>['slotProps'],
    ): { label: HTMLLabelElement; input: HTMLInputElement; container: HTMLElement } => {
        const { container } = render(
            <Autocomplete<string>
                variant="chipsInput"
                labels={{ title: 'Tags', inputPlaceholder: 'Add a tag' }}
                slotProps={slotProps}
            />,
        );

        return {
            label: container.querySelector('label') as HTMLLabelElement,
            input: container.querySelector('input') as HTMLInputElement,
            container,
        };
    };

    it('passes slotProps.inputLabel through, keeping the label bound to the input', () => {
        const { label, input } = setup({ textField: { slotProps: { inputLabel: { shrink: true } } } });

        expect(label.getAttribute('data-shrink')).toBe('true');
        expect(input.id).not.toBe('');
        expect(label.htmlFor).toBe(input.id);
    });

    it('passes the deprecated InputLabelProps through as well', () => {
        const { label, input } = setup({ textField: { InputLabelProps: { shrink: true } } });

        expect(label.getAttribute('data-shrink')).toBe('true');
        expect(label.htmlFor).toBe(input.id);
    });

    it('passes slotProps.htmlInput through without losing the test id or MUI wiring', () => {
        const { input } = setup({ textField: { slotProps: { htmlInput: { maxLength: 5 } } } });

        expect(input.getAttribute('maxlength')).toBe('5');
        expect(input.getAttribute('data-testid')).toBe('ring-autocomplete-input');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
    });

    it('still creates a chip on Enter with caller slot props in place', () => {
        const { input, container } = setup({
            textField: { slotProps: { inputLabel: { shrink: true }, htmlInput: { maxLength: 10 } } },
        });

        fireEvent.change(input, { target: { value: 'design' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent)).toEqual([
            'design',
        ]);
    });

    it('leaves the label unshrunk when the caller sets nothing', () => {
        const { label } = setup(undefined);

        expect(label.getAttribute('data-shrink')).toBe('false');
    });
});
