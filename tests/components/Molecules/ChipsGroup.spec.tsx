import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ChipProps } from '@mui/material';
import { ChipsGroup } from '../../../src/components/Molecules/ChipsGroup/ChipsGroup.js';
import { ThemeConfig } from '../../../src/theme/theme.js';

vi.useFakeTimers();

describe('Components: ChipsGroup', () => {
    const TestComponent = ({ chips }: { chips: ChipProps[] }): React.JSX.Element => {
        return (
            <div style={{ width: '300px' }}>
                <ChipsGroup chips={chips} />
            </div>
        );
    };

    it('should render component with 2 chips visible', () => {
        const { getAllByText } = render(
            <TestComponent
                chips={[
                    {
                        label: 'Chip 1',
                        color: 'primary',
                        variant: 'outlined',
                        sx: {
                            background: 'red',
                        },
                    },
                    {
                        label: 'Chip 2',
                        color: 'primary',
                        variant: 'filled',
                    },
                ]}
            />,
        );
        const visibleChips = getAllByText(/Chip \d/);
        expect(visibleChips.length).toBe(2);
    });

    // FIXME: There is a problem with this test after migrating from jest to vitest. To be investigated...
    it.skip('should render "+x" chip when not all chips fit in the container', async () => {
        const chips = [
            {
                label: 'Chip 1',
            },
            {
                label: 'Chip 2',
            },
            {
                label: 'Chip 3',
            },
            {
                label: 'Chip 4',
            },
            {
                label: 'Chip 5',
            },
            {
                label: 'Chip 6',
            },
            {
                label: 'Chip 7',
            },
            {
                label: 'Chip 8',
            },
        ];

        const { getByTestId, findByText } = render(<TestComponent chips={chips} />);
        const container = getByTestId('chips-group-container');

        // Mock offsetWidth for the container
        Object.defineProperty(container, 'offsetWidth', {
            configurable: true,
            value: 300,
        });

        // Mock offsetWidth for each chip
        const chipElements = container.querySelectorAll('.MuiChip-root');

        chipElements.forEach((chip) => {
            Object.defineProperty(chip, 'offsetWidth', {
                configurable: true,
                value: 50,
            });
        });

        // Trigger the effect that calculates visible chips
        fireEvent(window, new Event('resize'));

        const expandChip = await findByText(/^\+\d+$/);

        expect(expandChip.textContent).toMatch(/^\+\d+$/);
    });

    // FIXME: jsdom issue, offsetWidth is 0
    // it('should render component with 2 chips visible', async () => {
    //     const {findAllByTestId} = render(<TestComponent chips={[
    //         {
    //             label: 'Chip 1',
    //             color: 'primary',
    //             variant: 'outlined'
    //         },
    //         {
    //             label: 'Chip 2',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 3',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 4',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 5',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 6',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 7',
    //             color: 'primary',
    //             variant: 'filled'
    //         },
    //         {
    //             label: 'Chip 8',
    //             color: 'primary',
    //             variant: 'filled'
    //         }
    //     ]}
    //     />);
    //     await waitFor(async () => {
    //         const chips = await findAllByTestId(/chip/);
    //         const hiddenChips = chips.filter(chip => {
    //             const style = window.getComputedStyle(chip);
    //             return style.visibility === 'hidden';
    //         });
    //
    //         expect(hiddenChips.length).toBe(4);
    //     })
    // });

    describe('click propagation to a clickable parent surface', () => {
        // In jsdom every element has offsetWidth 0, so no chip fits the container:
        // all chips land in the overflow and the +N control chip is always rendered.
        const chips: ChipProps[] = [{ label: 'Tag A' }, { label: 'Tag B' }, { label: 'Tag C' }];

        it('should not propagate clicks on the show-more menu chip, while still opening the menu', () => {
            const onParentClick = vi.fn();
            const { getByTestId, getAllByText } = render(
                <div onClick={onParentClick}>
                    <ChipsGroup chips={chips} />
                </div>,
            );

            fireEvent.click(getByTestId('ring-chipsgroup-show-more'));

            expect(onParentClick).not.toHaveBeenCalled();
            // The ActionBox still opens — it listens on the anchor element directly.
            // 'Tag A' now appears twice: the (hidden) overflow chip and the menu item.
            expect(getAllByText('Tag A')).toHaveLength(2);
        });

        it('should keep the show-more menu chip out of the tab order', () => {
            const { getByTestId } = render(<ChipsGroup chips={chips} />);
            const anchor = getByTestId('ring-chipsgroup-show-more');

            // Enter on a focusable anchor would not open the menu, which waits for a native click.
            expect(anchor.getAttribute('role')).toBeNull();
            expect(anchor.getAttribute('tabindex')).toBeNull();
        });

        it('should not propagate clicks on the +N expand chip', () => {
            const onParentClick = vi.fn();
            const { getByTestId, getAllByText } = render(
                <div onClick={onParentClick}>
                    <ChipsGroup chips={chips} expandable={true} />
                </div>,
            );

            fireEvent.click(getByTestId('ring-chipsgroup-expandable'));

            expect(onParentClick).not.toHaveBeenCalled();
            // The group did expand: each overflow chip is rendered a second time
            // (the measurement copy is always in the DOM, only hidden).
            expect(getAllByText(/Tag [ABC]/)).toHaveLength(6);
        });

        it('should not propagate clicks on the "Show less" chip', () => {
            const onParentClick = vi.fn();
            const { getByTestId, getByText, queryByText } = render(
                <div onClick={onParentClick}>
                    <ChipsGroup chips={chips} expandable={true} collapsable={true} />
                </div>,
            );

            fireEvent.click(getByTestId('ring-chipsgroup-expandable'));
            expect(getByText('Show less')).toBeDefined();

            fireEvent.click(getByText('Show less'));

            expect(onParentClick).not.toHaveBeenCalled();
            // The group collapsed back.
            expect(queryByText('Show less')).toBeNull();
        });

        it('should not propagate clicks on the "Show less" delete icon', () => {
            const onParentClick = vi.fn();
            const { getByTestId, getByText, queryByText } = render(
                <div onClick={onParentClick}>
                    <ChipsGroup chips={chips} expandable={true} collapsable={true} />
                </div>,
            );

            fireEvent.click(getByTestId('ring-chipsgroup-expandable'));

            const showLessChip = getByText('Show less').closest('.MuiChip-root') as HTMLElement;
            const deleteIcon = showLessChip.querySelector('.MuiChip-deleteIcon') as SVGElement;
            fireEvent.click(deleteIcon);

            expect(onParentClick).not.toHaveBeenCalled();
            expect(queryByText('Show less')).toBeNull();
        });
    });

    it('should derive the control chip border from the theme, so it follows the palette mode', () => {
        const chips: ChipProps[] = [{ label: 'Tag A' }, { label: 'Tag B' }, { label: 'Tag C' }];

        const light = render(
            <ThemeConfig mode="light">
                <ChipsGroup chips={chips} expandable={true} />
            </ThemeConfig>,
        );
        const lightBorder = getComputedStyle(light.getByTestId('ring-chipsgroup-expandable')).borderColor;
        light.unmount();

        const dark = render(
            <ThemeConfig mode="dark">
                <ChipsGroup chips={chips} expandable={true} />
            </ThemeConfig>,
        );
        const darkBorder = getComputedStyle(dark.getByTestId('ring-chipsgroup-expandable')).borderColor;

        // A hardcoded colour would render identically in both modes.
        expect(lightBorder).toBeTruthy();
        expect(darkBorder).not.toBe(lightBorder);
    });
});
