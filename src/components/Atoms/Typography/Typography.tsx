import React, { useRef, useLayoutEffect, useState } from 'react';
import { Typography as MuiTypography, Tooltip, TypographyProps, TooltipProps } from '@mui/material';

export interface OverflowTypographyProps extends TypographyProps {
    /**
     * Enable overflow handling with ellipsis and tooltip
     * @default false
     */
    enableOverflow?: boolean;
    tooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
}

export function OverflowTypography(props: OverflowTypographyProps): React.JSX.Element {
    const { enableOverflow = false, tooltipProps, children, ...typographyProps } = props;

    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);

    useLayoutEffect(() => {
        const el = textRef.current;

        if (el) {
            setIsOverflowed(el.scrollWidth > el.clientWidth);
        }
    }, [children]);

    const typography = (
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

    if (!enableOverflow) {
        return <MuiTypography {...typographyProps}>{children}</MuiTypography>;
    } else {
        return isOverflowed ? (
            <Tooltip title={children} {...tooltipProps}>
                {typography}
            </Tooltip>
        ) : (
            typography
        );
    }
}

export { OverflowTypography as Typography };
