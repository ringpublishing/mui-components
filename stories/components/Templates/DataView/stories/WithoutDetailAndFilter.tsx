import React from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import type { StoryObj, Meta } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithoutDetailAndFilterExample.tsx?raw';
import { DataView, type DataViewProps, type TopSlotProps, RingDataGrid } from '../../../../../src/index.js';
import { DefaultDataViewArgs, searchBarChildren } from '../common/defaultArgs.js';

type DataViewMeta = Meta<typeof DataView>;

const Example = (args: Partial<DataViewProps>): React.JSX.Element => {
    const actionColumns: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 250 }];
    const actionRows: GridRowsProp = [
        {
            id: 0,
            name: 'George Washington',
        },
        {
            id: 1,
            name: 'John Adams',
        },
        {
            id: 2,
            name: 'Thomas Jefferson',
        },
        {
            id: 3,
            name: 'James Madison',
        },
        {
            id: 4,
            name: 'James Monroe',
        },
        {
            id: 5,
            name: 'John Quincy Adams',
        },
    ];

    return (
        <DataView
            {...args}
            slots={{
                main: (
                    <RingDataGrid
                        rows={actionRows}
                        columns={actionColumns}
                        totalRowCount={actionRows.length}
                        onRowClick={(): void => {
                            /* noop */
                        }}
                    />
                ),
                ...args.slots,
            }}
            slotProps={{
                ...args.slotProps,
                top: {
                    children: searchBarChildren,
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                    ...args.slotProps?.top,
                } as TopSlotProps,
            }}
        />
    );
};

export const WithoutDetailAndFilter: StoryObj<DataViewMeta> = {
    args: {
        ...DefaultDataViewArgs,
    },

    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode,
            example: <Example {...args} />,
        });
    },
};
