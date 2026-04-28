import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { EditableText } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof EditableText>;

const Example = (args: React.ComponentProps<typeof EditableText>): React.JSX.Element => {
    const [text, setText] = useState(args.text);

    const handleSubmit = (value: string): Promise<boolean> => {
        action('onSubmit')(value);
        setText(value);

        return Promise.resolve(true);
    };

    return <EditableText {...args} text={text} onSubmit={handleSubmit} />;
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
