import { vi, describe, expect, it } from 'vitest';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Edit } from '@mui/icons-material';
import { useSpacer, createSpacerItem } from '../../../../src/components/Organisms/DataGrid/spacer.js';
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
                icon: <Edit fontSize="small" color={'primary'} />,
            }),
        },
    ];

    const columns: GridColDef[] = [{ field: 'title', headerName: 'Title', width: 100 }];

    it('should render correctly', () => {
        expect(render(<DataGrid rows={rows} columns={columns} {...useSpacer({})} />).container).toMatchSnapshot();
    });
});
