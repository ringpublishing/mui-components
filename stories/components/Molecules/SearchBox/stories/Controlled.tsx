import type { StoryObj } from '@storybook/react-vite';
import { SearchBox } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import ControlledExampleCode from './code/ControlledExample.tsx?raw';
import React from 'react';

type Story = StoryObj<typeof SearchBox>;

const Example = (args: React.ComponentProps<typeof SearchBox>): React.JSX.Element => {
    const [value, setValue] = React.useState('');

    return <SearchBox {...args} value={value} onChange={setValue} />;
};

export const Controlled: Story = {
    args: {
        ...defaultArgs,
        className: 'custom-class-name',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: ControlledExampleCode,
        }),
};
