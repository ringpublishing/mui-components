import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ChipsGroup } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof ChipsGroup>;

const Example = (args: React.ComponentProps<typeof ChipsGroup>): React.JSX.Element => {
    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup {...args} />
        </div>
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
