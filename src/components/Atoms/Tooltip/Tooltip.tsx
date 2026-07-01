import React from 'react';
import classNames from 'classnames';
import { Box, Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../Typography/Typography.js';

export interface TooltipProps extends MuiTooltipProps, Omit<CommonComponentProps, 'children'> {
    /**
     * Tooltip content (string title or custom ReactNode).
     */
    title: string | React.ReactNode;
    /**
     * Optional subtitle displayed below the title.
     */
    subTitle?: string;
    /**
     * Optional hint displayed next to the title (e.g. keyboard shortcut).
     */
    hint?: string;
}

export function Tooltip(props: TooltipProps): React.JSX.Element {
    const { title, subTitle, hint, className, dataTestIdSuffix, ...otherProps } = props;

    const dataTestId = useRingDataTestId(Tooltip.name, dataTestIdSuffix);

    return (
        <MuiTooltip
            data-testid={dataTestId}
            className={classNames('ring-tooltip', className)}
            title={
                // Prevents rendering broken Tooltip when title is undefined or is an empty string
                title ? (
                    <Box>
                        <Box display="flex" flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
                            {typeof title === 'string' ? <Typography variant={'caption'}>{title}</Typography> : title}
                            {hint && (
                                <Typography variant={'caption'} color={'textDisabled'} ml={0.5}>
                                    {hint}
                                </Typography>
                            )}
                        </Box>
                        {subTitle && (
                            <Typography variant={'caption'} color={'textDisabled'}>
                                {subTitle}
                            </Typography>
                        )}
                    </Box>
                ) : (
                    ''
                )
            }
            {...otherProps}
        />
    );
}
