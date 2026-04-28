import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithRecentlyUsedExampleCode from './code/WithRecentlyUsedExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithRecentlyUsed: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'search by', recentlyUsed: 'Recently used', recentlyUsedResults: 'Results' },
        defaultValue: options[0],
        showRecentlyUsed: true,
        recentlyLocalStorageKey: 'recentlyUsed',
        recentlyUsedLimit: 3,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithRecentlyUsedExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
