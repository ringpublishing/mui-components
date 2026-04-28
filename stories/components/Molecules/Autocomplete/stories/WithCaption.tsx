import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCaptionExampleCode from './code/WithCaptionExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { optionsWithCaption } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithCaption: Story = {
    args: {
        ...defaultArgs,
        options: optionsWithCaption,
        defaultValue: optionsWithCaption[0],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithCaptionExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
