import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion, AccordionProps } from '../../../src/index.js';

describe('Component: Accordion', () => {
    it('should render correctly', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
        };

        const { container } = render(<Accordion {...mockProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should render with button', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            buttonLabel: 'Button',
            buttonOnClick: vi.fn(),
        };

        const { container } = render(<Accordion {...mockProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should render with button and call onClick', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            buttonLabel: 'Button',
            buttonOnClick: vi.fn(),
        };

        render(<Accordion {...mockProps} />);

        fireEvent.click(screen.getByText('Button'));

        expect(mockProps.buttonOnClick).toHaveBeenCalled();
    });

    it('should correctly render borderless', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            variant: 'borderless',
        };

        const { container } = render(<Accordion {...mockProps} />);

        expect(container).toMatchSnapshot();
    });
});
