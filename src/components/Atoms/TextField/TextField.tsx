import React, { useRef } from 'react';
import { IconButton, TextField as MuiTextField, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { Action } from '../../../types.js';
import { MoreVert } from '@mui/icons-material';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

type MuiTextFieldProps = React.ComponentProps<typeof MuiTextField>;

export interface TextFieldProps extends CommonComponentProps, MuiTextFieldProps {
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
    actions?: Action[];
}

export function TextField(props: TextFieldProps): React.JSX.Element {
    const { actions = [], className, dataTestIdSuffix, InputProps, InputLabelProps, ...otherProps } = props;
    const ref = useRef<HTMLButtonElement>(null);

    const dataTestId = useRingDataTestId(TextField.name, dataTestIdSuffix);

    // Ensure InputLabel variant matches TextField variant (only if variant is explicitly set)
    const labelProps = props.variant
        ? {
              ...InputLabelProps,
              variant: props.variant,
          }
        : InputLabelProps;

    return (
        <MuiTextField
            data-testid={dataTestId}
            className={classNames('ring-textfield', className)}
            slotProps={{
                htmlInput: {
                    'data-testid': `${dataTestId}-input`,
                },
            }}
            {...otherProps}
            InputLabelProps={labelProps}
            InputProps={{
                ...InputProps,
                endAdornment:
                    actions.length > 0 &&
                    (actions.length === 1 ? (
                        <Tooltip title={actions[0].disabledReason || actions[0].label}>
                            <IconButton
                                sx={{ p: '4px', ml: 1 }}
                                onClick={(event: React.MouseEvent<HTMLElement>): void => {
                                    event.preventDefault();
                                    actions[0].onClick?.(event);
                                }}
                                disabled={actions[0].disabled}
                                data-testid={`${dataTestId}-action`}
                            >
                                {actions[0].icon}
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <IconButton ref={ref} sx={{ p: '4px', ml: 1 }} data-testid={`${dataTestId}-actions`}>
                            <MoreVert />
                            <ActionBox actions={actions} anchorEl={ref} dataTestIdSuffix={dataTestIdSuffix} />
                        </IconButton>
                    )),
                sx: {
                    ...InputProps?.sx,
                    minHeight: '32px', // space is needed for the endAdornment to not change the height of the input
                },
            }}
        />
    );
}
