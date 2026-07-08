import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomTooltipExampleCode from './code/WithCustomTooltipExample.tsx?raw';
import { Typography } from '../../../../../src/index.js';

type Story = StoryObj<typeof Typography>;

const Example = (args: React.ComponentProps<typeof Typography>): React.JSX.Element => {
    return <Typography {...args} />;
};

export const WithCustomTooltip: Story = {
    args: {
        enableOverflow: true,
        alwaysShowTooltip: true,
        children: 'This row truncates with an ellipsis and always shows a custom tooltip on hover',
        tooltipTitle: (
            <>
                John Doe
                <br />
                Senior Photographer
                <br />
                New York, USA
            </>
        ),
        sx: {
            width: '320px',
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithCustomTooltipExampleCode,
            example: <Example {...args} />,
        });
    },
};
