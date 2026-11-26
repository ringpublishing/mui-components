import React, { forwardRef } from 'react';
import { TabScrollButton, useTheme, type TabScrollButtonProps } from '@mui/material';

export interface SideRailScrollButtonProps extends TabScrollButtonProps {
    /** `data-testid` of the list's scroll buttons; each button ends it with `-up` or `-down`. */
    'data-testid'?: string;
}

/*
 * A scroll button of the rail's list. `Tabs` renders the same slot at both ends and tells them apart only by
 * `direction`, which it mirrors in a right-to-left theme; the button at the start of the list scrolls it up.
 */
function SideRailScrollButtonWithoutRef(
    props: SideRailScrollButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
): React.JSX.Element {
    const { direction, 'data-testid': dataTestId, ...other } = props;
    const theme = useTheme();
    const isStart = (direction === 'left') !== (theme.direction === 'rtl');

    return (
        <TabScrollButton
            ref={ref}
            direction={direction}
            data-testid={dataTestId && `${dataTestId}-${isStart ? 'up' : 'down'}`}
            {...other}
        />
    );
}

export const SideRailScrollButton = forwardRef<HTMLButtonElement, SideRailScrollButtonProps>(
    SideRailScrollButtonWithoutRef,
);
