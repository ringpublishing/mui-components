import React from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Remove, Edit, MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import {
    renderActionCell,
    renderComboCell,
    renderLinkCell,
    createSpacerItem,
    RingDataGrid,
    Action,
} from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function CustomCellsExample(): React.JSX.Element {
    const actions: Action[] = [
        {
            label: 'Change name',
            onClick: (): void => undefined,
            icon: <Edit />,
        },
        {
            label: 'Remove',
            onClick: (): void => undefined,
            disabled: true,
            disabledReason: 'You cannot use this action',
            icon: <Remove />,
        },
    ];

    const rows: GridRowsProp = [
        {
            ...createSpacerItem({
                title: 'In progress',
                color: 'primary',
                id: 0,
                icon: <Edit fontSize="small" color="primary" />,
            }),
        },
        {
            id: 1,
            combo: {
                label: 'Ada i Michał z "Rolnika..." odliczają dni do ślubu.',
                caption: 'Ada i Michał z "Rolnik szuka żony" odliczają dni do ślubu.',
                imageUrl: getImagePath(TestImage.MOUNTAINS, ImageSize.MEDIUM),
                chips: ['chip1', { label: 'chip1', color: 'primary' }, 'long chip with very long description'],
                withComment: true,
                commentIconColor: 'primary',
                badge: 1,
            },
            link: { href: 'https://ringpublishing.com', text: 'ringpublishing.com', target: '_blank' },
            actions,
        },
        {
            ...createSpacerItem({ title: 'Test', id: 0 }),
        },
        {
            id: 2,
            combo: {
                label: 'John Adams',
                caption: 'Administrator',
                imageUrl: getImagePath(TestImage.BEACH, ImageSize.MEDIUM),
                chips: 'chip1',
            },
            link: { href: 'https://ringpublishing.com', text: 'ringpublishing.com', target: '_blank' },
            actions,
        },
        {
            id: 3,
            combo: {
                label: 'Thomas Jefferson',
                badge: 1,
            },
            link: { href: 'https://ringpublishing.com', text: 'ringpublishing.com', target: '_blank' },
            actions,
        },
        {
            ...createSpacerItem({
                title: 'With placeholders',
                color: 'primary',
                id: 0,
                icon: <Edit fontSize="small" color="primary" />,
            }),
        },
        {
            id: 4,
            combo: {
                label: 'Ada i Michał z "Rolnika..." odliczają dni do ślubu.',
                caption: 'Ada i Michał z "Rolnik szuka żony" odliczają dni do ślubu.',
                chips: ['chip1', { label: 'chip1', color: 'primary' }, 'long chip with very long description'],
                withComment: true,
                commentIconColor: 'primary',
                badge: 1,
                showPlaceholder: true,
            },
            link: { href: 'https://ringpublishing.com', text: 'ringpublishing.com', target: '_blank' },
            actions,
        },
    ];

    const columns: GridColDef[] = [
        { field: 'combo', headerName: 'Combo', width: 600, renderCell: renderComboCell },
        { field: 'link', headerName: 'Link', width: 150, renderCell: renderLinkCell },
        { field: 'actions', headerName: 'Action', width: 150, renderCell: renderActionCell },
    ];

    const sortableFields = [
        { name: 'Publication date', key: 'publicationDate', onSortingChange: (): void => undefined },
        { name: 'Created date', key: 'createdDate', onSortingChange: (): void => undefined },
    ];

    const labels = {
        results: 'Results',
        refresh: 'Refresh',
        enableAutoRefresh: 'Enable auto refresh',
        disableAutoRefresh: 'Disable auto refresh',
    };

    return (
        <div style={{ padding: '20px', height: '450px' }}>
            <RingDataGrid
                rows={rows}
                columns={columns}
                getRowHeight={(): 'auto' => 'auto'}
                showRingToolbar={true}
                labels={labels}
                sortableFields={sortableFields}
                autoRefresh={true}
                refreshCallback={(): void => undefined}
                refreshItems={(): void => undefined}
                additionalComponent={
                    <IconButton onClick={(): void => undefined}>
                        <MoreVert />
                    </IconButton>
                }
                rowHeight={35}
                columnHeaderHeight={40}
                totalRowCount={rows.length}
            />
        </div>
    );
}
