import React from 'react';
import { AvatarGroup as MuiAvatarGroup, Box, type Theme, type TypographyVariant } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { getStringColor } from '@ringpublishing/mui-theme';
import classNames from 'classnames';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { WithRootDataTestIdOverride, resolveRootDataTestId } from '../../../helpers/dataTestId.js';
import type { AvatarSize } from '../../Atoms/Avatar/Avatar.js';
import { AvatarSizeContext } from '../../Atoms/Avatar/AvatarSizeContext.js';

export interface AvatarGroupProps extends CommonComponentProps, WithRootDataTestIdOverride {
    /** The `Avatar`s of the group, in display order. */
    children?: React.ReactNode;
    /**
     * Size of every avatar in the group and of the counter: 24, 32 or 40 px.
     * @default 'large'
     */
    size?: AvatarSize;
    /**
     * Most items shown, the "+N" counter included; at least 2.
     * @default 5
     */
    max?: number;
    /** Number of people when the group renders only some of them; the counter then counts the rest. */
    total?: number;
    /**
     * Accessible name of the counter, given the number of people it stands for.
     * @default (count) => `${count} more`
     */
    surplusAriaLabel?: (count: number) => string;
}

const SPACING_FACTOR = { small: 3, medium: 4, large: 5 } as const;

const SURPLUS_TYPOGRAPHY: Record<AvatarSize, TypographyVariant> = {
    small: 'caption',
    medium: 'subtitle2',
    large: 'subtitle1',
};

function defaultSurplusAriaLabel(count: number): string {
    return `${count} more`;
}

/**
 * Overlapping `Avatar`s of one size, each ringed in the background colour, with a "+N" counter on the neutral
 * avatar colour once there are more people than `max` allows.
 */
export function AvatarGroup(props: AvatarGroupProps): React.JSX.Element {
    const {
        children,
        size = 'large',
        max = 5,
        total,
        surplusAriaLabel = defaultSurplusAriaLabel,
        className,
        sx,
        dataTestIdSuffix,
        dataTestId: dataTestIdOverride,
        'data-testid': dataTestIdAttribute,
    } = props;
    const generatedDataTestId = useRingDataTestId('AvatarGroup', dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(
        { dataTestId: dataTestIdOverride, 'data-testid': dataTestIdAttribute },
        generatedDataTestId,
    );

    return (
        <AvatarSizeContext.Provider value={size}>
            <MuiAvatarGroup
                data-testid={dataTestId}
                className={classNames('ring-avatargroup', className)}
                max={max}
                total={total}
                // Neighbouring avatars overlap by 6px: both 2px rings and 2px of the fills.
                spacing={6}
                renderSurplus={(count): React.ReactNode => (
                    <>
                        <span aria-hidden={true}>+{count}</span>
                        <Box component="span" sx={visuallyHidden}>
                            {surplusAriaLabel(count)}
                        </Box>
                    </>
                )}
                slotProps={{
                    surplus: {
                        sx: (theme: Theme): object => {
                            // An empty string gets the neutral tone: the design's "+N" colour.
                            const { fill, fillText } = getStringColor('', theme);
                            const dimension = theme.getSpacing(SPACING_FACTOR[size]);

                            return {
                                width: dimension,
                                height: dimension,
                                bgcolor: fill,
                                color: fillText,
                                typography: SURPLUS_TYPOGRAPHY[size],
                            };
                        },
                    },
                }}
                // MUI lays the group out `row-reverse`, so at full width it would sit at the end of the line. The padding
                // (2px) keeps the avatars' rings off the group's edge.
                sx={[{ width: 'fit-content', p: 0.25 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
            >
                {children}
            </MuiAvatarGroup>
        </AvatarSizeContext.Provider>
    );
}
