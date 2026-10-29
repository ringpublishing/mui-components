import { describe, expect, it } from 'vitest';
import { Pencil } from 'lucide-react';
import { render, fireEvent } from '@testing-library/react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { createActionCellRenderer, renderActionCell } from '../../../../src/index.js';
import { Action } from '../../../../src/types.js';

describe('DataGrid - renderActionCell', () => {
    const actions: Action[] = [
        {
            label: 'Change name',
            onClick: () => null,
            icon: <Pencil />,
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

    it('should expose an accessible name on the actions button for every row', () => {
        const rows: GridRowsProp = [
            { id: 1, name: 'George Washington', actions },
            { id: 2, name: 'John Adams', actions },
            { id: 3, name: 'Thomas Jefferson', actions },
        ];
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
            { field: 'actions', headerName: 'Action', renderCell: renderActionCell },
        ];

        const { getAllByRole } = render(<DataGrid rows={rows} columns={columns} />);

        expect(getAllByRole('button', { name: 'More actions' })).toHaveLength(3);
    });

    it('should allow localizing the accessible name via createActionCellRenderer', () => {
        const rows: GridRowsProp = [{ id: 1, name: 'George Washington', actions }];
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
            {
                field: 'actions',
                headerName: 'Action',
                renderCell: createActionCellRenderer({ moreActions: 'Więcej akcji' }),
            },
        ];

        const { getByRole } = render(<DataGrid rows={rows} columns={columns} />);

        expect(getByRole('button', { name: 'Więcej akcji' })).toBeDefined();
    });

    it('should fall back to the default accessible name when the label is blank', () => {
        const rows: GridRowsProp = [{ id: 1, name: 'George Washington', actions }];
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
            {
                field: 'actions',
                headerName: 'Action',
                renderCell: createActionCellRenderer({ moreActions: '   ' }),
            },
        ];

        const { getByRole } = render(<DataGrid rows={rows} columns={columns} />);

        expect(getByRole('button', { name: 'More actions' })).toBeDefined();
    });
});
