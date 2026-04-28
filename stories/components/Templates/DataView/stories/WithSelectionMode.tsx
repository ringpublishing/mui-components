import type { StoryObj, Meta } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithSelectionModeExample.tsx?raw';
import { DataViewWrapper } from '../common/DataViewWrapper.js';
import { DataView } from '../../../../../src/index.js';
import { BottomBarContextState } from '../../../../../src/components/internal/BottomBar/BottomBarContext.js';

type DataViewMeta = Meta<typeof DataView>;

export const WithSelectionMode: StoryObj<DataViewMeta> = {
    args: {
        slotProps: {
            bottomBar: {
                labels: {
                    selected: 'selected',
                    show: undefined,
                    hide: undefined,
                },
                showVisibilityToggle: true,
                showImagePlaceholder: true,
                fieldMap: {
                    name: 'title.label',
                    image: 'title.imageUrl',
                },
                onClick: (item: Record<string, unknown>, apiRef: BottomBarContextState['apiRef']): void => {
                    action('BottomBar item clicked')(item, apiRef);
                },
            },
        },
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode,
            example: <DataViewWrapper {...args} gridProps={{ enableBulkActions: true }} />,
        });
    },
};
