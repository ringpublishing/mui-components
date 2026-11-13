import { describe, expect, it } from 'vitest';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Pencil } from 'lucide-react';
import { useSpacer, createSpacerItem } from '../../../../src/components/internal/spacer.js';
import { RingLucideIcon } from '../../../../src/helpers/RingLucideIcon.js';
import { render, within } from '../../../test-utils/customRenderer.js';

describe('DataGrid - spacer', () => {
    const rows: GridRowsProp = [
        { ...createSpacerItem({ title: 'default' }) },
        { id: 1, title: 'Home page' },
        {
            ...createSpacerItem({
                title: 'custom',
                id: 'customId',
                color: 'primary',
                icon: <RingLucideIcon icon={Pencil} fontSize="small" color="primary" />,
            }),
        },
    ];

    const columns: GridColDef[] = [{ field: 'title', headerName: 'Title', width: 100 }];

    it('should render correctly', () => {
        const { getAllByRole } = render(<DataGrid rows={rows} columns={columns} {...useSpacer({})} />);
        const [headerRow, defaultSpacer, dataRow, customSpacer, ...otherRows] = getAllByRole('row');

        expect(within(headerRow).getByRole('columnheader', { name: 'Title' })).toBeTruthy();
        expect(otherRows).toHaveLength(0);

        // A spacer replaces the grid row: one cell with the icon and the title, and no cell per column.
        [defaultSpacer, customSpacer].forEach((spacer) => {
            expect(spacer.hasAttribute('data-id')).toBe(false);
            expect(within(spacer).getAllByRole('gridcell')).toHaveLength(1);
            expect(getComputedStyle(spacer).height).toBe('30px');
        });

        expect(within(defaultSpacer).getByRole('gridcell').textContent).toBe('default');
        expect(defaultSpacer.querySelectorAll('svg')).toHaveLength(1);
        expect(defaultSpacer.querySelector('svg.lucide-calendar-days')?.getAttribute('width')).toBe('20');

        expect(within(customSpacer).getByRole('gridcell').textContent).toBe('custom');
        expect(customSpacer.querySelectorAll('svg')).toHaveLength(1);
        expect(customSpacer.querySelector('.ring-lucide-icon svg.lucide-pencil')).toBeTruthy();

        // Only a spacer below another row draws the line that separates it from that row.
        expect(getComputedStyle(defaultSpacer).borderTopStyle).not.toBe('solid');
        expect(getComputedStyle(customSpacer).borderTopStyle).toBe('solid');
        expect(getComputedStyle(customSpacer).borderTopWidth).toBe('1px');
        expect(getComputedStyle(defaultSpacer).borderBottomStyle).not.toBe('solid');
        expect(getComputedStyle(customSpacer).borderBottomStyle).not.toBe('solid');

        expect(dataRow.getAttribute('data-id')).toBe('1');
        expect(within(dataRow).getByRole('gridcell', { name: 'Home page' })).toBeTruthy();

        expect(
            [defaultSpacer, customSpacer].map((spacer) => Array.from(within(spacer).getByRole('gridcell').childNodes)),
        ).toMatchSnapshot();
    });

    it('should render palette-colored Lucide icons with currentColor', () => {
        const { container } = render(<DataGrid rows={rows} columns={columns} {...useSpacer({})} />);

        expect(container.querySelector('.ring-lucide-icon svg')?.getAttribute('stroke')).toBe('currentColor');
    });
});
