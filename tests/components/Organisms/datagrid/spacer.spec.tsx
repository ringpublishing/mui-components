import { vi, describe, expect, it } from 'vitest';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Pencil } from 'lucide-react';
import { useSpacer, createSpacerItem } from '../../../../src/components/internal/spacer.js';
import { RingLucideIcon } from '../../../../src/helpers/RingLucideIcon.js';
import { render } from '../../../test-utils/customRenderer.js';

vi.spyOn(global.Math, 'random').mockReturnValueOnce(0.1111111111111111);

vi.spyOn(global.Math, 'random').mockReturnValueOnce(0.2222222222222222);

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
        expect(render(<DataGrid rows={rows} columns={columns} {...useSpacer({})} />).container).toMatchSnapshot();
    });

    it('should render palette-colored Lucide icons with currentColor', () => {
        const { container } = render(<DataGrid rows={rows} columns={columns} {...useSpacer({})} />);

        expect(container.querySelector('.ring-lucide-icon svg')?.getAttribute('stroke')).toBe('currentColor');
    });
});
