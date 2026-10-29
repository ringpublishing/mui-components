import React, { useRef } from 'react';
import { IconButton, TextField as MuiTextField, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { EllipsisVertical } from 'lucide-react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { DEFAULT_LUCIDE_ICON_SIZE } from '../../../helpers/lucideSize.js';
import { Action } from '../../../types.js';
import { ActionBox } from '../ActionBox/ActionBox.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { WithRootDataTestIdOverride, resolveRootDataTestId } from '../../../helpers/dataTestId.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';

type MuiTextFieldProps = React.ComponentProps<typeof MuiTextField>;

export interface TextFieldProps extends CommonComponentProps, MuiTextFieldProps, WithRootDataTestIdOverride {
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
    /**
     * Accessible name of the icon button that opens the `actions` menu, shown when more than one action is given.
     * A blank value counts as not provided.
     * @default 'More actions'
     */
    actionsAriaLabel?: string;
}

export function TextField(props: TextFieldProps): React.JSX.Element {
    const {
        actions = [],
        actionsAriaLabel,
        className,
        dataTestIdSuffix,
        InputProps,
        InputLabelProps,
        inputProps,
        slotProps,
        // Both are destructured so neither reaches the DOM through the spread below.
        dataTestId: dataTestIdOverride,
        'data-testid': dataTestIdAttribute,
        ...otherProps
    } = props;
    const ref = useRef<HTMLButtonElement>(null);

    const generatedDataTestId = useRingDataTestId('TextField', dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(
        { dataTestId: dataTestIdOverride, 'data-testid': dataTestIdAttribute },
        generatedDataTestId,
    );

    /*
     * `slotProps.htmlInput` is merged rather than replaced, so the input test id, a caller's
     * `inputProps` and their own `htmlInput` all reach the input.
     */
    const mergedSlotProps = {
        ...slotProps,
        htmlInput: {
            'data-testid': `${dataTestId}-input`,
            ...inputProps,
            ...slotProps?.htmlInput,
        },
    } as MuiTextFieldProps['slotProps'];

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
            {...otherProps}
            slotProps={mergedSlotProps}
            InputLabelProps={labelProps}
            InputProps={{
                ...InputProps,
                endAdornment:
                    actions.length > 0 &&
                    (actions.length === 1 ? (
                        <Tooltip title={actions[0].disabledReason || actions[0].label}>
                            <IconButton
                                sx={{ ml: 1 }}
                                aria-label={actions[0].label}
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
                        <IconButton
                            ref={ref}
                            sx={{ ml: 1 }}
                            aria-label={resolveMoreActionsAriaLabel(actionsAriaLabel)}
                            data-testid={`${dataTestId}-actions`}
                        >
                            <EllipsisVertical size={DEFAULT_LUCIDE_ICON_SIZE} />
                            <ActionBox actions={actions} anchorEl={ref} dataTestId={`${dataTestId}-menu`} />
                        </IconButton>
                    )),
            }}
        />
    );
}
