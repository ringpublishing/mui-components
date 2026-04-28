import { action } from 'storybook/actions';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Edit, Remove } from '@mui/icons-material';

import {
    Action,
    createSpacerItem,
    renderActionCell,
    renderComboCell,
    renderLinkCell,
    RingDataGridProps,
} from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

const defaultFilterChips = {
    chips: [
        {
            filter: 'Date from',
            value: '10/10/2025',
            onDelete: (): void => {
                console.debug('Delete filter chip');
            },
        },
        {
            filter: 'Date to',
            value: '10/11/2025',
            onDelete: (): void => {
                console.debug('Delete filter chip');
            },
        },
    ],
    onDeleteAll: (): void => {
        console.debug('Delete all filter chips');
    },
};

const sortableFields = [
    { name: 'Publication date', key: 'publicationDate', onSortingChange: action('onSortingChange') },
    { name: 'Created date', key: 'createdDate', onSortingChange: action('onSortingChange') },
];

const defaultArgs: Partial<RingDataGridProps> = {
    filterChips: defaultFilterChips,
    sortableFields,
};

const actions: Action[] = [
    {
        label: 'Change name',
        onClick: () => null,
        icon: <Edit />,
    },
    {
        label: 'Remove',
        onClick: () => null,
        disabled: true,
        disabledReason: 'You cannot use this action',
        icon: <Remove />,
    },
];

const customCellsRows: GridRowsProp = [
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

const customCellsColumns: GridColDef[] = [
    { field: 'combo', headerName: 'Combo', width: 600, renderCell: renderComboCell },
    { field: 'link', headerName: 'Link', width: 300, renderCell: renderLinkCell },
    { field: 'actions', headerName: 'Action', width: 150, renderCell: renderActionCell },
];

const ringToolbarRows: GridRowsProp = [
    {
        id: 0,
        title: 'Article 1',
        publicationDate: '10/16/2003, 7:11:27 PM',
        createdDate: '6/23/1979, 10:49:45 AM',
    },
    {
        id: 1,
        title: 'Article 2',
        publicationDate: '7/13/2022, 9:39:01 AM',
        createdDate: '2/14/2010, 1:58:50 PM',
    },
    {
        id: 2,
        title: 'Article 3',
        publicationDate: '3/12/2011, 1:51:17 AM',
        createdDate: '12/16/1995, 12:41:50 PM',
    },
    {
        id: 3,
        title: 'Article 4',
        publicationDate: '10/14/2017, 3:34:42 PM',
        createdDate: '8/3/1991, 8:54:26 AM',
    },
    {
        id: 4,
        title: 'Article 5',
        publicationDate: '2/22/1974, 2:57:38 PM',
        createdDate: '6/9/2021, 4:51:03 PM',
    },
    {
        id: 5,
        title: 'Article 6',
        publicationDate: '3/11/1989, 5:08:24 AM',
        createdDate: '11/13/2011, 3:42:29 AM',
    },
    {
        id: 6,
        title: 'Article 7',
        publicationDate: '1/26/2016, 6:59:18 AM',
        createdDate: '5/18/2004, 3:07:56 AM',
    },
    {
        id: 7,
        title: 'Article 8',
        publicationDate: '6/1/2006, 2:33:56 PM',
        createdDate: '7/1/1991, 11:53:42 AM',
    },
    {
        id: 8,
        title: 'Article 9',
        publicationDate: '11/10/1996, 11:55:32 AM',
        createdDate: '10/31/1998, 9:59:05 AM',
    },
    {
        id: 9,
        title: 'Article 10',
        publicationDate: '1/7/2021, 8:09:34 PM',
        createdDate: '10/21/1974, 8:53:11 PM',
    },
];

const ringToolbarColumns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'publicationDate', headerName: 'Publication date', width: 200 },
    { field: 'createdDate', headerName: 'Created date', width: 200 },
];

export { defaultFilterChips, sortableFields, customCellsRows, customCellsColumns, ringToolbarRows, ringToolbarColumns };
export default defaultArgs;
