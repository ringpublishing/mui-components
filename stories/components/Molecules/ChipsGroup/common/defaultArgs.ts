import { ChipProps } from '@mui/material';
import { action } from 'storybook/actions';
import { ChipsGroupProps } from '../../../../../src/index.js';

const defaultChips: ChipProps[] = [
    {
        id: '1',
        label: 'Chip 1',
        color: 'warning',
        variant: 'outlined',
    },
    {
        id: '2',
        label: 'Chip 2',
        color: 'primary',
        variant: 'filled',
        onClick: (): void => {
            action('Chip 2 clicked')();
        },
        onDelete: (): void => {
            action('Delete chip 2')();
        },
    },
    {
        id: '3',
        label: 'Chip 3',
        color: 'secondary',
        variant: 'filled',
        onDelete: (): void => {
            action('Delete chip 3')();
        },
    },
    {
        id: '4',
        label: 'Chip 4',
        color: 'secondary',
        variant: 'filled',
        onDelete: (): void => {
            action('Delete chip 4')();
        },
    },
    {
        id: '5',
        label: 'Chip 5',
        color: 'primary',
        variant: 'outlined',
        onClick: (): void => {
            action('Chip 5 clicked')();
        },
        onDelete: (): void => {
            action('Delete chip 5')();
        },
    },
    {
        id: '6',
        label: 'Chip 6',
        color: 'secondary',
        variant: 'filled',
    },
];

const defaultArgs: Partial<ChipsGroupProps> = {
    chips: defaultChips,
    expandable: false,
    collapsable: false,
    onDeleteAll: undefined,
    customLabels: undefined,
};

export default defaultArgs;
