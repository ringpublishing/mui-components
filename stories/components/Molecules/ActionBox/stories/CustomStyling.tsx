import React, { useRef } from 'react';
import { Button, Theme } from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';
import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import CustomStylingCode from './code/CustomStylingExample.tsx?raw';
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

export const CustomStyling: Story = {
    args: {
        ...defaultArgs,
        actions: [
            ...(defaultArgs.actions?.slice(0, 2) ?? []),
            {
                label: 'Styled last action',
                onClick: () => null,
                icon: <RocketLaunch />,
                sx: (theme: Theme) => ({
                    color: theme.palette.common.black,
                    backgroundColor: theme.palette.error.main,
                    '&:hover': {
                        backgroundColor: theme.palette.error.dark,
                    },
                }),
            },
        ],
        sx: (theme) => ({
            color: theme.palette.common.white,
            backgroundColor: theme.palette.success.main,
        }),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: CustomStylingCode,
            example: <ActionBoxExample {...args} />,
        });
    },
};
