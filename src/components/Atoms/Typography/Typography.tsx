import React, { useRef, useLayoutEffect, useState } from 'react';
import { Typography as MuiTypography, Tooltip, TypographyProps, TooltipProps } from '@mui/material';

export interface OverflowTypographyProps extends TypographyProps {
    /**
     * Enable overflow handling with ellipsis and tooltip
     * @default false
     */
    enableOverflow?: boolean;
    /**
     * Always render the tooltip on hover, regardless of whether the text overflows.
     * @default false
     */
    alwaysShowTooltip?: boolean;
    /**
     * Custom tooltip content. When omitted, the tooltip shows the Typography children.
     */
    tooltipTitle?: React.ReactNode;
    tooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
}

export function OverflowTypography(props: OverflowTypographyProps): React.JSX.Element {
    const {
        enableOverflow = false,
        alwaysShowTooltip = false,
        tooltipTitle,
        tooltipProps,
        children,
        ...typographyProps
    } = props;

    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);

    useLayoutEffect(() => {
        const el = textRef.current;

        if (el) {
            setIsOverflowed(el.scrollWidth > el.clientWidth);
        }
    }, [children]);

    const overflowTypography = (
        <MuiTypography
            {...typographyProps}
            sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: '100%',
                ...typographyProps.sx,
            }}
            ref={textRef}
            {...(typographyProps.dangerouslySetInnerHTML
                ? { dangerouslySetInnerHTML: typographyProps.dangerouslySetInnerHTML }
                : null)}
        >
            {children}
        </MuiTypography>
    );

    const content = enableOverflow ? (
        overflowTypography
    ) : (
        <MuiTypography {...typographyProps}>{children}</MuiTypography>
    );

    const showTooltip = alwaysShowTooltip || (enableOverflow && isOverflowed);

    if (showTooltip) {
        return (
            <Tooltip title={tooltipTitle ?? children} {...tooltipProps}>
                {content}
            </Tooltip>
        );
    }

    return content;
}

export { OverflowTypography as Typography };
