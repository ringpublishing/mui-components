import type { StoryObj, Meta } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithSelectionModeExample.tsx?raw';
import WithSelectionModeExample from './code/WithSelectionModeExample.js';
import { DataView } from '../../../../../src/index.js';

type DataViewMeta = Meta<typeof DataView>;

export const WithSelectionMode: StoryObj<DataViewMeta> = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode,
            example: <WithSelectionModeExample />,
        });
    },
};
