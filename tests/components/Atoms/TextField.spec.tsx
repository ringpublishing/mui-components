import { vi, describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TextField, TextFieldProps } from '../../../src/components/Atoms/TextField/TextField.js';

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
        const { container } = render(<TextField {...defaultProps} actions={actions} />);

        expect(container).toMatchSnapshot;
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
});
