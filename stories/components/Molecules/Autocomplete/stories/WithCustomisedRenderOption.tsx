import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomisedRenderOptionExampleCode from './code/WithCustomisedRenderOptionExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options, Option } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithCustomisedRenderOption: Story = {
    args: {
        ...defaultArgs,
        defaultValue: options[0],
        renderOption: (
            props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
            option: unknown,
        ): React.ReactNode => {
            const typedOption = option as Option;

            return (
                <li {...props}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            overflow: 'hidden',
                            wordBreak: 'break-all',
                        }}
                    >
                        <Typography>{typedOption.label}</Typography>
                        <InfoOutlined />
                    </Box>
                </li>
            );
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithCustomisedRenderOptionExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
