import { describe, expect, it } from 'vitest';
import { Edit } from '@mui/icons-material';
import { render, fireEvent } from '@testing-library/react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { renderActionCell } from '../../../../src/index.js';
import { Action } from '../../../../src/types.js';

describe('DataGrid - renderActionCell', () => {
    const actions: Action[] = [
        {
            label: 'Change name',
            onClick: () => null,
            icon: <Edit />,
        },
    ];

    it('should render correctly', () => {
        const rows: GridRowsProp = [
            { id: 1, name: 'George Washington', actions },
            { id: 2, name: 'John Adams', actions },
            { id: 3, name: 'Thomas Jefferson', actions },
        ];
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
            { field: 'actions', headerName: 'Action', renderCell: renderActionCell },
        ];

        expect(render(<DataGrid rows={rows} columns={columns} />).container).toMatchSnapshot();
    });

    it('should not select the row when clicking the action button', () => {
        const rows: GridRowsProp = [{ id: 1, name: 'George Washington', actions }];
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
            { field: 'actions', headerName: 'Action', renderCell: renderActionCell },
        ];

        const { container } = render(<DataGrid rows={rows} columns={columns} checkboxSelection={true} />);

        const checkbox = container.querySelector('input[type="checkbox"][aria-label="Select row"]') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        const actionButton = container.querySelector('button') as HTMLButtonElement;
        fireEvent.click(actionButton);

        expect(checkbox.checked).toBe(false);
    });
});
