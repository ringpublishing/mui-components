import { describe, expect, it } from 'vitest';
import { render, within } from '@testing-library/react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { renderLinkCell } from '../../../../src/components/Organisms/DataGrid/renderLinkCell.js';

describe('DataGrid - renderLinkCell', () => {
    const rows: GridRowsProp = [
        { id: 1, title: 'Home page', link: { href: 'https://ringpublishing.com', text: 'ringpublishing.com' } },
        {
            id: 2,
            title: 'Components',
            link: { href: 'https://design.ringpublishing.com', text: 'design.ringpublishing.com' },
        },
        { id: 3, title: 'Blog', link: { href: 'https://ringpublishing.com/blog', text: 'ringpublishing.com' } },
        { id: 4, title: 'Platform', link: { href: 'https://app.ringpublishing.com/' } },
    ];

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', width: 100 },
        { field: 'link', headerName: 'Link', width: 600, renderCell: renderLinkCell },
    ];

    it('should render correctly', () => {
        const { getAllByRole } = render(<DataGrid rows={rows} columns={columns} />);
        const linkCells = getAllByRole('gridcell').filter((cell) => cell.getAttribute('data-field') === 'link');

        expect(
            linkCells.map((cell) => {
                const link = within(cell).getByRole('link');

                return {
                    text: link.textContent,
                    href: link.getAttribute('href'),
                    target: link.getAttribute('target'),
                    testId: link.getAttribute('data-testid'),
                };
            }),
        ).toEqual([
            {
                text: 'ringpublishing.com',
                href: 'https://ringpublishing.com',
                target: null,
                testId: 'ring-datagrid-item-1-link',
            },
            {
                text: 'design.ringpublishing.com',
                href: 'https://design.ringpublishing.com',
                target: null,
                testId: 'ring-datagrid-item-2-link',
            },
            {
                text: 'ringpublishing.com',
                href: 'https://ringpublishing.com/blog',
                target: null,
                testId: 'ring-datagrid-item-3-link',
            },
            // Without `text` the link shows its address.
            {
                text: 'https://app.ringpublishing.com/',
                href: 'https://app.ringpublishing.com/',
                target: null,
                testId: 'ring-datagrid-item-4-link',
            },
        ]);
        // The assertions above name what a consumer relies on; the snapshot guards the rest of what the renderer
        // puts into the cell.
        expect(Array.from(linkCells[0].childNodes)).toMatchSnapshot();
    });

    it('should pass the target to the link', () => {
        const { getByRole } = render(
            <DataGrid
                rows={[{ id: 1, link: { href: 'https://ringpublishing.com', text: 'New tab', target: '_blank' } }]}
                columns={columns}
            />,
        );

        expect(getByRole('link', { name: 'New tab' }).getAttribute('target')).toBe('_blank');
    });
});
