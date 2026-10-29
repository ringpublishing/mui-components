import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Typography } from '@mui/material';
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

    it('should render a composed label as separate summary columns', () => {
        const mockProps: AccordionProps = {
            label: (
                <>
                    <Typography variant="body1" component="span">
                        Accordion
                    </Typography>
                    <Typography variant="body1" component="span" color="text.secondary">
                        Secondary
                    </Typography>
                </>
            ),
            children: <div>Opened accordion</div>,
        };

        const { container } = render(<Accordion {...mockProps} />);

        expect(screen.getByText('Secondary')).toBeTruthy();
        expect(container).toMatchSnapshot();
    });

    it('should render the label inside the summary button without invalid DOM nesting', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
        };

        render(<Accordion {...mockProps} />);

        const labelNode = screen.getByText('Accordion');

        // `body1` maps to <p>, and MUI renders the summary as a real <button> — hence
        // `component="span"`. A <p> here triggers React's validateDOMNesting warning.
        expect(labelNode.tagName).toBe('SPAN');
        expect(labelNode.closest('button')).toBeTruthy();
    });

    it('should render the action in the final summary column', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            buttonLabel: 'Button',
            buttonOnClick: vi.fn(),
        };

        const { container } = render(<Accordion {...mockProps} />);
        const summaryContent = container.querySelector('.MuiAccordionSummary-content');

        expect(Array.from(summaryContent?.children ?? []).map((child) => child.textContent)).toEqual([
            'Accordion',
            'Button',
        ]);
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

    it('should not nest the action button inside another button', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            buttonLabel: 'Button',
            buttonOnClick: vi.fn(),
        };

        const { container } = render(<Accordion {...mockProps} />);

        // `<button>` inside `<button>` is invalid HTML and makes React log a hydration error.
        expect(container.querySelector('button button')).toBeNull();

        // The summary keeps its button semantics without being a button element.
        const summary = screen.getByTestId('ring-accordion-expand');

        expect(summary.tagName).not.toBe('BUTTON');
        expect(summary.getAttribute('role')).toBe('button');
        expect(summary.getAttribute('tabindex')).toBe('0');
    });

    it('should keep the native summary button and drop the action when disabled', () => {
        const mockProps: AccordionProps = {
            label: 'Accordion',
            children: <div>Opened accordion</div>,
            buttonLabel: 'Button',
            buttonOnClick: vi.fn(),
            disabled: true,
        };

        render(<Accordion {...mockProps} />);

        const summary = screen.getByTestId('ring-accordion-expand');

        // A non-native ButtonBase only gets `aria-disabled` and would still toggle on click,
        // so the disabled case stays a real <button> — and the action, inert in there anyway,
        // is not rendered at all.
        expect(summary.tagName).toBe('BUTTON');
        expect(summary).toHaveProperty('disabled', true);
        expect(screen.queryByTestId('ring-accordion-button')).toBeNull();
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
