import { styled } from '@mui/material';
import React from 'react';
import { CommonComponentProps } from '../../helpers/commonTypes.js';

export interface AspectRatioOwnerStateProps {
    /**
     * The CSS object-fit value.
     * @default 'contain'
     */
    objectFit?: React.CSSProperties['objectFit'];
    /**
     * The aspect-ratio of the element. The current implementation uses padding instead of the CSS aspect-ratio due to browser support.
     * https://caniuse.com/?search=aspect-ratio
     * @default '4/3'
     */
    ratio?: number | string;
}

interface AspectRatioProps extends AspectRatioOwnerStateProps, CommonComponentProps {
    children?: React.ReactNode;
}

const AspectRatioRoot = styled('div')<{ ownerState: AspectRatioOwnerStateProps }>(({ theme, ownerState }) => {
    // TU NIE DZIALA
    return {
        '--AspectRatio-paddingBottom': `clamp(var(--AspectRatio-minHeight), calc(100% / (${ownerState.ratio})), var(--AspectRatio-maxHeight))`,
        '--AspectRatio-maxHeight': '9999px',
        '--AspectRatio-minHeight': '0px',
        '--Icon-color': 'currentColor',
        borderRadius: 'var(--AspectRatio-radius)',
        display: 'block',
        flex: 'initial',
        flexDirection: 'column',
        margin: 'var(--AspectRatio-margin)',
        backgroundColor: theme.palette.components.appBar.defaultFill,
    };
});

const AspectRatioContent = styled('div')<{ ownerState: AspectRatioOwnerStateProps }>(({ ownerState }) => ({
    flex: 1,
    position: 'relative',
    borderRadius: 'inherit',
    height: 0,
    paddingBottom: 'calc(var(--AspectRatio-paddingBottom) - 2 * var(--variant-borderWidth, 0px))',
    overflow: 'hidden',
    transition: 'inherit',
    '& [data-first-child]': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: ownerState.objectFit,
        margin: 0,
        padding: 0,
        '& > img': {
            width: '100%',
            height: '100%',
            objectFit: ownerState.objectFit,
        },
    },
}));

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>((inProps, ref) => {
    const { children, ratio = '4/3', objectFit = 'contain', className, sx } = inProps;
    const ownerState = {
        ratio,
        objectFit,
    };

    return (
        <AspectRatioRoot className={className} ownerState={ownerState} sx={sx} ref={ref}>
            <AspectRatioContent ownerState={ownerState}>
                {React.Children.map(children, (child, index) =>
                    index === 0 && React.isValidElement(child)
                        ? React.cloneElement(child, { 'data-first-child': '' } as Record<string, string>)
                        : child,
                )}
            </AspectRatioContent>
        </AspectRatioRoot>
    );
});

AspectRatio.displayName = 'AspectRatio';
