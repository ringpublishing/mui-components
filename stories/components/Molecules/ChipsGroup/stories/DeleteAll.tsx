import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';
import { ChipsGroup } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DeleteAllExampleCode from './code/DeleteAllExample.tsx?raw';

type Story = StoryObj<typeof ChipsGroup>;

const Example = (args: React.ComponentProps<typeof ChipsGroup>): React.JSX.Element => {
    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup {...args} />
        </div>
    );
};

export const DeleteAll: Story = {
    args: {
        ...defaultArgs,
        chips: defaultArgs.chips?.slice(0, 2),
        onDeleteAll: (): void => {
            action('Clear chips')();
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DeleteAllExampleCode,
            example: <Example {...args} />,
        });
    },
};
