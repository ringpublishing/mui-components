import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ChipProps } from '@mui/material';
import { ChipsGroup } from '../../../src/components/Molecules/ChipsGroup/ChipsGroup.js';

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
});
