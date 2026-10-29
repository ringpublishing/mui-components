import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography } from '@mui/material';
import { FeaturedIcon, type FeaturedIconProps } from '../../../../../src/index.js';

import { createCodeStory, preset } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import defaultArgs from '../common/defaultArgs.js';
import { ICONS, SLOT_PROPS } from '../common/presets.js';

type DefaultArgs = FeaturedIconProps & { boxWidth: number; boxHeight: number };

/** What the browser drew: plate and glyph size, glyph stroke. Demo only. */
function useReading(frame: React.RefObject<HTMLDivElement | null>): string {
    const [reading, setReading] = useState('');

    const read = useCallback((): void => {
        const plate = frame.current?.querySelector('.ring-featuredicon > div');
        const glyph = plate?.querySelector('svg:not(.ring-gradient-definition)');

        if (!plate || !glyph) {
            return;
        }

        const round = (value: number): number => Math.round(value * 10) / 10;

        setReading(
            `plate ${round(plate.getBoundingClientRect().width)} px · glyph ${round(glyph.getBoundingClientRect().width)} px · ${
                // A filled icon (MUI) has no stroke; the computed 1px would only be the CSS initial value.
                glyph.getAttribute('stroke')
                    ? `stroke ${getComputedStyle(glyph).strokeWidth}`
                    : 'filled icon, no stroke'
            }`,
        );
    }, [frame]);

    // The observer follows the box; a control changes the plate without resizing the box, so every render reads too.
    useLayoutEffect(() => {
        const element = frame.current;

        if (!element) {
            return undefined;
        }

        const observer = new ResizeObserver(read);

        observer.observe(element);

        return (): void => observer.disconnect();
    }, [frame, read]);

    useLayoutEffect(read);

    return reading;
}

function Example({ boxWidth, boxHeight, ...args }: DefaultArgs): React.JSX.Element {
    const frame = useRef<HTMLDivElement>(null);
    const reading = useReading(frame);

    return (
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Box
                ref={frame}
                sx={{
                    width: boxWidth,
                    height: boxHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'components.media.backgroundFill',
                    // An outline, not a border: a border would shrink the box `inherit` measures.
                    outline: '1px dashed',
                    outlineColor: 'divider',
                }}
            >
                <FeaturedIcon {...args} />
            </Box>
            <Typography variant="caption" color="text.secondary">
                {reading}
            </Typography>
        </Stack>
    );
}

export const Default: StoryObj = {
    // Description and type columns next to each control, so a ready value is never read as the prop's type.
    parameters: { controls: { expanded: true } },
    args: {
        ...defaultArgs,
        icon: 'image',
        slotProps: 'none',
        boxWidth: 320,
        boxHeight: 180,
    },
    argTypes: {
        icon: preset(ICONS, 'A lucide icon, as `RingLucideIcon` takes it, or a ready element; the component sizes it.'),
        slotProps: preset(SLOT_PROPS, '`plate.sx` styles the circle behind the glyph.'),
        boxWidth: {
            control: { type: 'range', min: 24, max: 600, step: 1 },
            description:
                'Not a `FeaturedIcon` prop: the width of the box this story puts the icon in. `size="inherit"` sizes itself from it.',
            table: { category: 'demo (not a FeaturedIcon prop)', type: { summary: 'number' } },
        },
        boxHeight: {
            control: { type: 'range', min: 24, max: 400, step: 1 },
            description: 'Not a `FeaturedIcon` prop: the height of that box.',
            table: { category: 'demo (not a FeaturedIcon prop)', type: { summary: 'number' } },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...(args as DefaultArgs)} />,
        }),
};
