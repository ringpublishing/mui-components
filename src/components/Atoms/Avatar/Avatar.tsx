import React, { useContext } from 'react';
import { Avatar as MuiAvatar, type Theme, type TypographyVariant } from '@mui/material';
import { getStringColor } from '@ringpublishing/mui-theme';
import classNames from 'classnames';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { WithRootDataTestIdOverride, resolveRootDataTestId } from '../../../helpers/dataTestId.js';
import { AvatarSizeContext } from './AvatarSizeContext.js';

export type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarProps extends Omit<CommonComponentProps, 'children'>, WithRootDataTestIdOverride {
    /** Full name of the person. The initials are taken from it, and it is the avatar's accessible name. */
    name: string;
    /**
     * Stable key of the person, such as a user ID, that picks the colour whatever the name; pass one spelling of it
     * everywhere, as hyphens, braces or a prefix change the colour, unlike case and surrounding spaces. Falls back to
     * `name` when it is missing, empty or only spaces.
     */
    colorKey?: string;
    /** URL of the photo. Without it, or when it fails to load, the avatar shows the initials on a colour. */
    src?: string;
    /**
     * `small`, `medium` and `large` are 24, 32 and 40 px. Inside an `AvatarGroup` the group's size wins.
     * @default 'large'
     */
    size?: AvatarSize;
}

const SPACING_FACTOR = { small: 3, medium: 4, large: 5 } as const;

const INITIALS_TYPOGRAPHY: Record<AvatarSize, TypographyVariant> = {
    small: 'caption',
    medium: 'body1',
    large: 'h6',
};

// First letters of the first and the last word; `Array.from` keeps a letter outside the BMP whole, and NFC keeps
// a letter sent decomposed (`S` + U+0301) whole, as `getStringColorTone` reads it.
function initialsOf(name: string): string {
    const words = name.normalize('NFC').trim().split(/\s+/).filter(Boolean);
    const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;

    return letters
        .map((word) => Array.from(word)[0] ?? '')
        .join('')
        .toUpperCase();
}

/**
 * A person's photo, or their initials on a colour that `getStringColor` picks from `colorKey` (or `name`), so the
 * same person has the same colour wherever they appear. The initials always reach 4.5:1 against the colour.
 */
export function Avatar(props: AvatarProps): React.JSX.Element {
    const {
        name,
        colorKey,
        src,
        size,
        className,
        sx,
        dataTestIdSuffix,
        dataTestId: dataTestIdOverride,
        'data-testid': dataTestIdAttribute,
    } = props;
    const groupSize = useContext(AvatarSizeContext);
    const generatedDataTestId = useRingDataTestId('Avatar', dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(
        { dataTestId: dataTestIdOverride, 'data-testid': dataTestIdAttribute },
        generatedDataTestId,
    );
    const effectiveSize = groupSize ?? size ?? 'large';
    const initials = initialsOf(name);

    return (
        <MuiAvatar
            data-testid={dataTestId}
            className={classNames('ring-avatar', className)}
            src={src}
            alt={name}
            role="img"
            aria-label={name}
            sx={[
                (theme: Theme): object => {
                    const { fill, fillText } = getStringColor(colorKey?.trim() ? colorKey : name, theme);
                    const dimension = theme.getSpacing(SPACING_FACTOR[effectiveSize]);

                    return {
                        width: dimension,
                        height: dimension,
                        bgcolor: fill,
                        color: fillText,
                        typography: INITIALS_TYPOGRAPHY[effectiveSize],
                    };
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {initials || undefined}
        </MuiAvatar>
    );
}
