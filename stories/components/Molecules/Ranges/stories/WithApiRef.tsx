import React, { useRef } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box, Button } from '@mui/material';
import { Ranges, RangesApiRef } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import { rangeDefinitions, labels } from '../common/defaultArgs.js';
import WithApiRefExampleCode from './code/WithApiRefExample.tsx?raw';

type Story = StoryObj<typeof Ranges>;

function RangesWithApiRefWrapper(): React.JSX.Element {
    const apiRef = useRef<RangesApiRef>(null);

    return (
        <Box>
            <Box sx={{ marginBottom: 4, paddingBottom: 2, borderBottom: '1px dashed #ccc' }}>
                <Button variant="outlined" size="small" onClick={() => apiRef.current?.resetRanges()}>
                    Reset Ranges
                </Button>
            </Box>
            <Box width={'200px'}>
                <Ranges
                    rangeDefinitions={rangeDefinitions}
                    maxAppliedRanges={2}
                    labels={labels}
                    onChange={(ranges) => action('onChange')(JSON.stringify(ranges))}
                    apiRef={apiRef}
                />
            </Box>
        </Box>
    );
}

export const WithApiRef: Story = {
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithApiRefExampleCode,
            example: <RangesWithApiRefWrapper />,
        }),
};
