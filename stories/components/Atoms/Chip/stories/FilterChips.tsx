import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import FilterChipsExampleCode from './code/FilterChipsExample.tsx?raw';
import FilterChipsExample from './code/FilterChipsExample.js';

type Story = StoryObj<typeof Chip>;

export const FilterChips: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    tags: ['!dev'],
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: FilterChipsExampleCode,
            example: <FilterChipsExample />,
        });
    },
};
