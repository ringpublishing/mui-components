import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithLabelExampleCode from './code/WithLabelExample.tsx?raw';
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

export const WithLabel: Story = {
    args: {
        ...defaultArgs,
        label: 'Article title',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithLabelExampleCode,
            example: <Example {...args} />,
        });
    },
};
