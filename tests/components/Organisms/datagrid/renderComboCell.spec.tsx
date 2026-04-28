import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid, GridRowsProp, GridColDef, GridRowHeightReturnValue } from '@mui/x-data-grid';
import { renderComboCell } from '../../../../src/index.js';

describe('DataGrid - renderComboCell', () => {
    const comboRows: GridRowsProp = [
        {
            id: 1,
            combo: {
                label: 'Ada i Michał z "Rolnika..." odliczają dni do ślubu. Taką suknię będzie miała panna młoda: nie chcemy przesadzać',
                caption:
                    'Ada i Michał z "Rolnik szuka żony" odliczają dni do ślubu. Taką suknię Ada i Michał z "Rolnika..." ' +
                    'odliczają dni do ślubu. Taką suknię ',
                imageUrl: 'https://design.ringpublishing.com/images/mountains_medium.jpg',
                chips: [
                    'chip0',
                    { label: 'chip1', color: 'primary' },
                    'long chip with very long descirption',
                    'chips4',
                    'chips5',
                    'chips7',
                    'chips8',
                ],
                withComment: true,
                commentIconColor: 'primary',
                badge: 1,
            },
        },
        {
            id: 2,
            combo: {
                label: 'John Adams',
                caption: 'Administrator',
                imageUrl:
                    'https://www.africaventura.fr/_next/image?url=https%3A%2F%2Fmedia.venturatravel.org%2Funsafe%2F1300x%2Fsmart%2Fday_detail%2Fdef634ac-a0e7-4c81-b6ce-7a614198ccfc-_mg_9740.jpg&w=3840&q=75',
                chips: 'chip1',
            },
        },
        {
            id: 3,
            combo: {
                label: 'Thomas Jefferson',
                badge: 1,
            },
        },
    ];
    const comboColumns: GridColDef[] = [
        { field: 'id', headerName: 'Id', width: 100 },
        { field: 'combo', headerName: 'Combo', width: 600, renderCell: renderComboCell },
    ];

    it('should render correctly', () => {
        const { container, getByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} getRowHeight={(): GridRowHeightReturnValue => 'auto'} />,
        );
        expect(container).toMatchSnapshot();
        expect(getByText('chip0')).toBeTruthy();
        expect(getByText('Administrator')).toBeTruthy();
        expect(getByText('John Adams')).toBeTruthy();
    });

    it('should render correctly for height between 52 and 105', () => {
        const { container, getByText, queryByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} rowHeight={80} />,
        );
        expect(container).toMatchSnapshot();
        expect(queryByText('chip0')).toBeNull();
        expect(getByText('Administrator')).toBeTruthy();
        expect(getByText('John Adams')).toBeTruthy();
    });

    it('should render correctly for density=compact', () => {
        const { container, getByText, queryByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} density="compact" />,
        );
        expect(container).toMatchSnapshot();
        expect(queryByText('chip0')).toBeNull();
        expect(queryByText('Administrator')).toBeNull();
        expect(getByText('John Adams')).toBeTruthy();
    });

    it('should show placeholder when imageUrl is undefined and showPlaceholder is true', () => {
        const { container, getByTestId } = render(
            <DataGrid
                rows={[
                    {
                        id: 1,
                        combo: {
                            label: 'Thomas Jefferson',
                            caption: 'Image url not provided and showPlaceholder is true',
                            badge: 1,
                            showPlaceholder: true,
                        },
                    },
                ]}
                columns={comboColumns}
                getRowHeight={(): GridRowHeightReturnValue => 'auto'}
            />,
        );
        expect(container).toMatchSnapshot();
        expect(getByTestId('PhotoOutlinedIcon')).toBeTruthy();
    });
});
