import React, { useRef } from 'react';
import classNames from 'classnames';

import { Box, Button, ButtonGroup, ButtonGroupOwnProps, Tooltip } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface SplitButtonProps extends CommonComponentProps, ButtonGroupOwnProps {
    /**
     * Array of actions.
     * `[{
     *     label: string;
     *     onClick: () => void;
     *     disabled?: boolean;
     *     disabledReason?: string;
     *     icon?: React.JSX.Element;
     * }]`
     */
    actions: Action[];
}

export function SplitButton(props: SplitButtonProps): React.JSX.Element {
    const { actions, className, sx, size = 'medium', ...buttonGroupProps } = props;
    const dataTestId = useRingDataTestId(SplitButton.name, props.dataTestIdSuffix);

    const mainAction = actions[0];
    const extraActions = actions.slice(1);

    const anchorRef = useRef<HTMLButtonElement>(null);

    return (
        <Box className={classNames('ring-split-button', className)} sx={{ textWrap: 'nowrap', ...sx }}>
            <ButtonGroup variant="outlined" color="primary" aria-label="split button" size={size} {...buttonGroupProps}>
                <Tooltip title={mainAction.disabled && mainAction.disabledReason} placement="bottom">
                    <Box>
                        <Button
                            data-testid={dataTestId}
                            onClick={mainAction.onClick}
                            disabled={mainAction.disabled || false}
                        >
                            {mainAction.label}
                        </Button>
                    </Box>
                </Tooltip>
                {extraActions.length > 0 && (
                    <Button
                        data-testid={`${dataTestId}-dropdown`}
                        size="small"
                        aria-label="split button dropdown"
                        aria-haspopup="menu"
                        ref={anchorRef}
                    >
                        <ArrowDropDown fontSize={size} />
                    </Button>
                )}
            </ButtonGroup>
            <ActionBox actions={extraActions} anchorEl={anchorRef} placement="bottom-end" tooltipPlacement="right" />
        </Box>
    );
}
