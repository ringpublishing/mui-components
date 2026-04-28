import { vi, describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AutocompleteChip, ChipsInput } from '../../../src/components/Molecules/ChipsInput/ChipsInput.js';
import { within } from '@testing-library/dom';

vi.useFakeTimers();

describe('Components: ChipsInput', () => {
    it('should render component properly', () => {
        const { container, getByTestId } = render(
            <ChipsInput
                labels={{
                    title: 'Chips input',
                    inputPlaceholder: 'Insert value and press enter',
                    alreadyOnList: 'Already on list',
                }}
                validationFunction={(value: AutocompleteChip): boolean => {
                    return !isNaN(parseInt(value.label));
                }}
                dataTestIdSuffix={'custom-suffix'}
                onChange={vi.fn()}
            />,
        );
        expect(container).toMatchSnapshot();
        const autocomplete = getByTestId('ring-chipsinput-custom-suffix');
        const input = within(autocomplete).getByRole('combobox');
        autocomplete.focus();
        fireEvent.change(input, { target: { value: 'abc' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        fireEvent.change(input, { target: { value: '123' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(container).toMatchSnapshot();
    });
});
