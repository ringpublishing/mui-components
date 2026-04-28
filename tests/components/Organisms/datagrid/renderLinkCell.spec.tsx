import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
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
        expect(render(<DataGrid rows={rows} columns={columns} />).container).toMatchSnapshot();
    });
});
