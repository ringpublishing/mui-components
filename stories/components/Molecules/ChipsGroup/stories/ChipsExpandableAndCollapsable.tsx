import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ChipsGroup } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import ChipsExpandableAndCollapsableExampleCode from './code/ChipsExpandableAndCollapsableExample.tsx?raw';

type Story = StoryObj<typeof ChipsGroup>;

const Example = (args: React.ComponentProps<typeof ChipsGroup>): React.JSX.Element => {
    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup {...args} />
        </div>
    );
};

export const ChipsExpandableAndCollapsable: Story = {
    args: {
        ...defaultArgs,
        expandable: true,
        collapsable: true,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ChipsExpandableAndCollapsableExampleCode,
            example: <Example {...args} />,
        });
    },
};
