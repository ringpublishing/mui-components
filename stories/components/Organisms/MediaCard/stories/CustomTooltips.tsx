import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import CustomTooltipsExampleCode from './code/CustomTooltipsExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => <MediaCard {...args} />;

export const CustomTooltips: Story = {
    args: {
        ...defaultArgs,
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
        fields: [
            // always-on tooltip; tooltip text = the row text
            { value: 'Source / Author', alwaysShowTooltip: true },
            // always-on tooltip with custom, multiline content different from the row
            {
                value: 'JD',
                alwaysShowTooltip: true,
                tooltipTitle: (
                    <>
                        John Doe
                        <br />
                        Senior Photographer
                        <br />
                        New York, USA
                    </>
                ),
            },
            // default: tooltip only when the row overflows and truncates
            { value: 'A long description that may overflow the card and truncate with an ellipsis' },
        ],
    },
    parameters: {
        docs: {
            description: {
                story:
                    'MediaCard field rows accept `alwaysShowTooltip` (show the tooltip on hover regardless of ' +
                    'overflow) and `tooltipTitle` (custom, possibly multiline, tooltip content different from the ' +
                    'row text). Rows without these props keep the default behavior — a tooltip only when the text ' +
                    'overflows.',
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: CustomTooltipsExampleCode,
            example: <Example {...args} />,
        }),
};
