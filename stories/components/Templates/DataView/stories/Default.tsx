import React, { useState } from 'react';
import type { StoryObj, Meta } from '@storybook/react-vite';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/DefaultExample.tsx?raw';
import { DataView, type DataViewProps, type TopSlotProps, Detail, RingDataGrid } from '../../../../../src/index.js';
import { DefaultDataViewArgs, Filter, searchBarChildren } from '../common/defaultArgs.js';

type DataViewMeta = Meta<typeof DataView>;

const Example = (args: Partial<DataViewProps>): React.JSX.Element => {
    const [detailText, setDetailText] = useState(-1);
    const [detailOpen, setDetailOpen] = useState(true);
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
    const detail = (
        <Detail
            empty={detailText === -1}
            main={{
                mediaProps: {
                    image: 'https://placehold.co/600x400?text=image+example',
                    objectFit: 'cover',
                },
                title: {
                    value: actionRows[detailText]?.name,
                },
            }}
        />
    );
    const grid = (
        <RingDataGrid
            rows={actionRows}
            columns={actionColumns}
            totalRowCount={actionRows.length}
            onRowClick={(params): void => {
                setDetailText(params.id as number);
            }}
        />
    );

    return (
        <DataView
            {...args}
            slots={{
                main: grid,
                left: <Filter />,
                right: detail,
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                    children: searchBarChildren,
                    ...args.slotProps?.top,
                } as TopSlotProps,
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
};

export const Default: StoryObj<DataViewMeta> = {
    args: {
        ...DefaultDataViewArgs,
        rightSlotOpen: true,
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
