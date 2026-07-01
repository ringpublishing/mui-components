import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Tooltip } from '../../../src/components/Atoms/Tooltip/Tooltip.js';
import { Button } from '@mui/material';

const triggerElement = <Button>Hover me</Button>;

describe('Tooltip', () => {
    it('should render correctly', () => {
        const { container } = render(
            <Tooltip title="Title" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(container).toMatchSnapshot();
    });

    it('should render the trigger element', () => {
        const { getByText } = render(<Tooltip title="Title">{triggerElement}</Tooltip>);

        expect(getByText('Hover me')).toBeDefined();
    });

    it('should display the title text when the tooltip is open', () => {
        const { getByText } = render(
            <Tooltip title="My tooltip title" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(getByText('My tooltip title')).toBeDefined();
    });

    it('should display the subtitle when provided', () => {
        const { getByText } = render(
            <Tooltip title="Title" subTitle="Extra info" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(getByText('Extra info')).toBeDefined();
    });

    it('should not display the subtitle when it is not provided', () => {
        const { queryByText } = render(
            <Tooltip title="Title" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(queryByText('Extra info')).toBeNull();
    });

    it('should display the hint when provided', () => {
        const { getByText } = render(
            <Tooltip title="Title" hint="⌘K" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(getByText('⌘K')).toBeDefined();
    });

    it('should not display the hint when it is not provided', () => {
        const { queryByText } = render(
            <Tooltip title="Title" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(queryByText('⌘K')).toBeNull();
    });

    it('should not render tooltip content when title is an empty string', () => {
        const { queryByRole } = render(
            <Tooltip title="" open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(queryByRole('tooltip')).toBeNull();
    });

    it('should render a ReactNode as title', () => {
        const customTitle = <span data-testid="custom-node">Custom Node</span>;

        const { getByTestId } = render(
            <Tooltip title={customTitle} open={true}>
                {triggerElement}
            </Tooltip>,
        );

        expect(getByTestId('custom-node')).toBeDefined();
    });

    it('should apply the default data-testid', () => {
        const { getByTestId } = render(<Tooltip title="Title">{triggerElement}</Tooltip>);

        expect(getByTestId('ring-tooltip')).toBeDefined();
    });

    it('should apply the dataTestIdSuffix to the data-testid', () => {
        const { getByTestId } = render(
            <Tooltip title="Title" dataTestIdSuffix="main">
                {triggerElement}
            </Tooltip>,
        );

        expect(getByTestId('ring-tooltip-main')).toBeDefined();
    });

    it('should apply a custom className alongside the default ring-tooltip class', () => {
        const { getByTestId } = render(
            <Tooltip title="Title" className="my-custom-class">
                {triggerElement}
            </Tooltip>,
        );

        const element = getByTestId('ring-tooltip');

        expect(element.classList.contains('ring-tooltip')).toBe(true);
        expect(element.classList.contains('my-custom-class')).toBe(true);
    });
});
