import React from 'react';
import { Chip } from '@mui/material';
import { TreeViewItem } from '../../../../../src/components/Organisms/TreeView/TreeView.js';

export const compactViewExampleItems: TreeViewItem[] = [
    {
        itemId: '0',
        label: 'Item 0',
        expanded: true,
        checkboxDisabled: true,
        element: React.createElement(Chip, { color: 'primary', label: 210, size: 'small', sx: { height: '18px' } }),
        items: [
            {
                itemId: '0.0',
                label: 'Item 0.0',
            },
            {
                itemId: '0.1',
                label: 'Item 0.1',
                element: React.createElement(Chip, {
                    color: 'primary',
                    label: 210,
                    size: 'small',
                    sx: { height: '18px' },
                }),
                items: [
                    {
                        itemId: '0.1.0',
                        label: 'Item 0.1.0',
                    },
                    {
                        itemId: '0.1.1',
                        label: 'Item 0.1.1',
                    },
                ],
            },
            {
                itemId: '0.2',
                label: 'Item 0.2',
            },
            {
                itemId: '0.3',
                label: 'Item 0.3',
            },
        ],
    },
    {
        itemId: '1',
        label: 'Item 1',
        element: React.createElement(Chip, { color: 'primary', label: 210, size: 'small', sx: { height: '18px' } }),
        items: [
            {
                itemId: '1.0',
                label: 'Item 1.0',
            },
            {
                itemId: '1.1',
                label: 'Item 1.1',
            },
        ],
    },
    {
        itemId: '2',
        label: 'Item 2',
        element: React.createElement(Chip, { color: 'primary', label: 210, size: 'small', sx: { height: '18px' } }),
        items: [
            {
                itemId: '2.0',
                label: 'Item 2.0',
            },
            {
                itemId: '2.1',
                label: 'Item 2.1',
            },
        ],
    },
    {
        itemId: '3',
        label: 'Item 3',
    },
];
