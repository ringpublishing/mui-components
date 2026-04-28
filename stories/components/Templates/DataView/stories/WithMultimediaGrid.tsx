import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithMultimediaGridExample.tsx?raw';
import { DataViewWrapper } from '../common/DataViewWrapper.js';
import { DEFAULT_COLUMNS } from '../../../../../src/components/Organisms/MultimediaGrid/useResolvedColumns.js';
import { DEFAULT_CELL_RATIO } from '../../../../../src/components/Organisms/MultimediaGrid/useCellRatio.js';

interface MultimediaGridArgs {
    columns?: object;
    cellRatio?: object | string;
    spacing?: number;
    rowSpacing?: number;
    columnSpacing?: number;
    overscan?: number;
    showRingToolbar?: boolean;
    loading?: boolean;
    error?: boolean;
}

export const WithMultimediaGrid: StoryObj<MultimediaGridArgs> = {
    args: {
        columns: DEFAULT_COLUMNS,
        cellRatio: DEFAULT_CELL_RATIO,
        spacing: 1,
        overscan: 1,
        showRingToolbar: true,
        loading: false,
        error: false,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode,
            example: <DataViewWrapper enabledMultimediaGrid={true} enableDynamicMultimediaGrid={true} {...args} />,
        });
    },
};
