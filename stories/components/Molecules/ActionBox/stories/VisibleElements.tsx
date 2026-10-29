import React, { useRef } from 'react';
import { Button } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import VisibleExampleCode from './code/VisibleElementsExample.tsx?raw';
import { ActionBox, ActionBoxProps } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof ActionBox>;

function ActionBoxExample(props: ActionBoxProps): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Button data-testid="action-box-trigger" variant="outlined" color="primary" ref={ref}>
                Click me!
            </Button>
            <ActionBox {...props} anchorEl={ref} />
        </div>
    );
}

export const VisibleElements: Story = {
    args: {
        ...defaultArgs,
        visibleActionsCount: 2,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: VisibleExampleCode,
            example: <ActionBoxExample {...args} />,
        });
    },
};
