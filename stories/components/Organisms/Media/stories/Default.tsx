import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory, preset } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { Media, type MediaProps } from '../../../../../src/index.js';
import defaultArgs, { MEDIA_WIDTH } from '../common/defaultArgs.js';
import {
    ACTIONS,
    BOTTOM_TOOLTIPS,
    DESCRIPTION_SUBMIT,
    HEIGHTS,
    IMAGES,
    STATUS_LABELS,
    TITLE_SUBMIT,
    loggedMedia,
} from '../common/presets.js';

type DefaultArgs = MediaProps & { width: number };

// The media element's events are logged in the Actions tab; the props the controls set are passed untouched.
const Example = ({ width, ...args }: DefaultArgs): React.JSX.Element => (
    <Media
        {...args}
        sx={{ ...(args.sx as object), width }}
        slotProps={{ ...args.slotProps, media: loggedMedia(args.slotProps?.media) }}
    />
);

export const Default: StoryObj = {
    // Description and type columns next to each control, so a ready value is never read as the prop's type.
    parameters: { controls: { expanded: true } },
    args: {
        ...defaultArgs,
        image: 'beach',
        statusLabels: 'two',
        actions: 'two',
        bottomTooltips: 'two',
        height: 'auto',
        onTitleSubmit: 'off',
        onDescriptionSubmit: 'off',
        width: MEDIA_WIDTH,
    },
    argTypes: {
        width: {
            control: { type: 'range', min: 80, max: 960, step: 10 },
            description: 'Not a `Media` prop: the width of the box this story puts Media in, to see how it scales.',
            table: { category: 'demo (not a Media prop)', type: { summary: 'number' } },
        },
        image: preset(IMAGES, 'Image URL or `{ src, thumbnailSrc, title }`; without it the placeholder shows.'),
        ratio: { control: 'select', options: ['3/2', '16/9', '4/3', '1/1', '9/16', '21/9'] },
        statusLabels: preset(STATUS_LABELS, 'Chips over the top-left corner, `{ label, color, icon }[]`.'),
        actions: preset(ACTIONS, 'Context menu actions, `{ label, icon }[]`.'),
        bottomTooltips: preset(BOTTOM_TOOLTIPS, 'Tooltip icons over the bottom-left corner, `{ title, icon }[]`.'),
        height: preset(HEIGHTS, 'Height of the media area, any CSS length.'),
        onTitleSubmit: preset(TITLE_SUBMIT, 'Makes the title editable; `(value: string) => Promise<boolean>`.'),
        onDescriptionSubmit: preset(
            DESCRIPTION_SUBMIT,
            'Makes the description editable; `(value: string) => Promise<boolean>`.',
        ),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...(args as DefaultArgs)} />,
        });
    },
};
