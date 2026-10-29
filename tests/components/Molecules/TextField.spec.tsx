import { vi, describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TextField, TextFieldProps } from '../../../src/components/Molecules/TextField/TextField.js';

describe('TextField Component', () => {
    const actions = [
        {
            label: 'Action Label',
            onClick: vi.fn(),
            icon: <span>Icon</span>,
        },
        {
            label: 'Action Label 2',
            onClick: vi.fn(),
            icon: <span>Icon 2</span>,
        },
    ];

    const defaultProps: TextFieldProps = {
        id: 'test-textfield',
        label: 'Test Label',
        actions: [actions[0]],
    };

    it('should render correctly', () => {
        const { container } = render(<TextField {...defaultProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with multiple actions', () => {
        const { getByRole, getAllByRole, queryByRole } = render(<TextField {...defaultProps} actions={actions} />);
        const menuButton = getByRole('button', { name: 'More actions' });

        expect(queryByRole('button', { name: 'Action Label' })).toBeNull();
        expect(queryByRole('menu')).toBeNull();

        fireEvent.click(menuButton);

        expect(getByRole('menu')).toBeTruthy();
        expect(getAllByRole('menuitem')).toHaveLength(2);
        // The fixture icons are text, so each item's accessible name starts with its icon.
        expect(getByRole('menuitem', { name: 'Icon Action Label' })).toBeTruthy();
        expect(getByRole('menuitem', { name: 'Icon 2 Action Label 2' })).toBeTruthy();
    });

    it('names the actions menu button "More actions" by default', () => {
        const { getByRole } = render(<TextField {...defaultProps} actions={actions} />);

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('takes the actions menu button name from actionsAriaLabel, a blank one falling back to the default', () => {
        const { getByRole, rerender } = render(
            <TextField {...defaultProps} actions={actions} actionsAriaLabel="Field options" />,
        );

        expect(getByRole('button', { name: 'Field options' })).toBeTruthy();

        rerender(<TextField {...defaultProps} actions={actions} actionsAriaLabel="" />);

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('should show the action box with actions when the moreVert icon is clicked', () => {
        const { getByTestId, getByText } = render(<TextField {...defaultProps} actions={actions} />);

        fireEvent.click(getByTestId('ring-textfield-actions'));

        expect(getByText('Icon')).toBeDefined();
        expect(getByText('Icon 2')).toBeDefined();
    });

    it('should render the action button when action prop is provided', () => {
        const { container } = render(<TextField {...defaultProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should call the action onClick handler when action button is clicked', () => {
        const { getByText } = render(<TextField {...defaultProps} />);
        const actionButton = getByText('Icon');

        fireEvent.click(actionButton);

        expect(defaultProps.actions?.[0]?.onClick).toHaveBeenCalled();
    });

    it('prefixes the input and action ids with a caller-supplied data-testid', () => {
        const { container } = render(
            <>
                <TextField data-testid="first-field" actions={[{ label: 'A' }]} />
                <TextField data-testid="second-field" actions={[{ label: 'A' }]} />
            </>,
        );
        const ids = Array.from(container.querySelectorAll('[data-testid]'))
            .map((element) => element.getAttribute('data-testid') as string)
            .filter((id) => id.includes('field'));

        expect(ids).toEqual([
            'first-field',
            'first-field-input',
            'first-field-action',
            'second-field',
            'second-field-input',
            'second-field-action',
        ]);
    });
});
