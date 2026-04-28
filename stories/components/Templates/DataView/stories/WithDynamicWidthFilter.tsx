import { useState } from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import type { StoryObj, Meta } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithDynamicWidthFilterExample.tsx?raw';
import { RingDataGrid, DataView, DataViewProps, type TopSlotProps } from '../../../../../src/index.js';
import { DefaultDataViewArgs, Detail, Filter, searchBarChildren } from '../common/defaultArgs.js';

type DataViewMeta = Meta<typeof DataView>;

interface ExtendedDataViewProps extends Partial<DataViewProps> {
    customCode?: string;
}

const Example = (args: ExtendedDataViewProps): React.JSX.Element => {
    const actionColumns: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 250 }];
    const actionRows: GridRowsProp = [
        {
            id: 0,
            name: 'George Washington aa',
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
    const [detailOpen, setDetailOpen] = useState(false);

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
                left: <Filter />,
                right: <Detail />,
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
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
};

export const WithDynamicWidthFilter: StoryObj<DataViewMeta> = {
    args: {
        ...DefaultDataViewArgs,
        leftSlotOpen: true,
        leftSlotWidth: 300,
        leftSlotDynamicWidth: {
            enabled: true,
            minWidth: 200,
            maxWidth: 500,
            onChange: action('filterWidth-changed'),
        },
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
