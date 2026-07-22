import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Alert, AlertProps } from '../../../src/components/Atoms/Alert/Alert.js';

describe('Alert Component', () => {
    const defaultProps: AlertProps = {
        severity: 'info',
        title: 'Alert title',
        description: 'Alert description',
    };

    it('should render correctly', () => {
        const { container } = render(<Alert {...defaultProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should render title only', () => {
        render(<Alert severity="info" title="Title only" />);

        expect(screen.getByText('Title only')).toBeDefined();
    });

    it('should render description only', () => {
        render(<Alert severity="info" description="Description only" />);

        expect(screen.getByText('Description only')).toBeDefined();
    });

    it('should render outlined action button with inherited color', () => {
        render(<Alert {...defaultProps} action={{ label: 'Action', onClick: vi.fn() }} />);

        const actionButton = screen.getByRole('button', { name: 'Action' });

        expect(actionButton.classList.contains('MuiButton-outlined')).toBe(true);
        expect(actionButton.classList.contains('MuiButton-sizeSmall')).toBe(true);
        expect(actionButton.classList.contains('MuiButton-colorInherit')).toBe(true);
    });

    it('should render close button when onClose is provided', () => {
        render(<Alert {...defaultProps} onClose={vi.fn()} />);

        expect(screen.getByLabelText('Close')).toBeDefined();
    });

    it('should render both action and close button when action and onClose are provided', () => {
        render(<Alert {...defaultProps} action={{ label: 'Action', onClick: vi.fn() }} onClose={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Action' })).toBeDefined();
        expect(screen.getByLabelText('Close')).toBeDefined();
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();

        render(<Alert {...defaultProps} onClose={onClose} />);

        fireEvent.click(screen.getByLabelText('Close'));

        expect(onClose).toHaveBeenCalled();
    });

    it('should call action onClick when action button is clicked', () => {
        const onAction = vi.fn();

        render(<Alert {...defaultProps} action={{ label: 'Action', onClick: onAction }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Action' }));

        expect(onAction).toHaveBeenCalled();
    });

    it('should render the bottom action layout', () => {
        const { container } = render(
            <Alert
                {...defaultProps}
                actionsPlacement="bottom"
                action={{ label: 'Action', onClick: vi.fn() }}
                onClose={vi.fn()}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it('should render the inline layout', () => {
        const { container } = render(
            <Alert
                {...defaultProps}
                layoutVariant="inline"
                actionsPlacement="bottom"
                action={{ label: 'Action', onClick: vi.fn() }}
                onClose={vi.fn()}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it('should apply the default data-testid', () => {
        render(<Alert {...defaultProps} />);

        expect(screen.getByTestId('ring-alert')).toBeDefined();
    });

    it('should apply the dataTestIdSuffix to the data-testid', () => {
        render(<Alert {...defaultProps} dataTestIdSuffix="main" />);

        expect(screen.getByTestId('ring-alert-main')).toBeDefined();
    });

    it('should apply a custom closeText to the close button aria-label', () => {
        render(<Alert {...defaultProps} onClose={vi.fn()} closeText="Zamknij" />);

        expect(screen.getByLabelText('Zamknij')).toBeDefined();
    });
});
