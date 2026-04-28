import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { SearchBox } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof SearchBox>;

const Example = (args: React.ComponentProps<typeof SearchBox>): React.JSX.Element => {
    return <SearchBox {...args} />;
};

export const Default: Story = {
    args: {
        ...defaultArgs,
        className: 'custom-class-name',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: DefaultExampleCode,
        }),
};
