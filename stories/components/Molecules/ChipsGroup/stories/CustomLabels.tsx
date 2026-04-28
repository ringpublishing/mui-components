import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';
import { ChipsGroup } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import CustomLabelsExampleCode from './code/CustomLabelsExample.tsx?raw';

type Story = StoryObj<typeof ChipsGroup>;

const Example = (args: React.ComponentProps<typeof ChipsGroup>): React.JSX.Element => {
    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup {...args} />
        </div>
    );
};

export const CustomLabels: Story = {
    args: {
        ...defaultArgs,
        expandable: true,
        collapsable: true,
        customLabels: {
            deleteAll: 'Delete all chips',
            showLess: 'Hide',
        },
        onDeleteAll: (): void => {
            action('Delete all chips')();
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: CustomLabelsExampleCode,
            example: <Example {...args} />,
        });
    },
};
