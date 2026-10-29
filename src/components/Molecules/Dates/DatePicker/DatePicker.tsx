import React, { useRef } from 'react';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';

import type {} from '@mui/x-date-pickers/AdapterDayjs';
import {
    DatePicker as MuiDatePicker,
    DatePickerProps as MuiDatePickerProps,
    PickersShortcutsItem,
} from '@mui/x-date-pickers-pro';

import { Action } from '../../../../types.js';
import { CommonComponentProps } from '../../../../helpers/commonTypes.js';
import { ActionsWithClearIconButton } from '../ActionsWithClearIconButton.js';
import { useRingDataTestId } from '../../../../helpers/hooks/useRingDataTestId.js';

/**
 * Props for the DatePicker component.
 */
export interface DatePickerProps extends MuiDatePickerProps, CommonComponentProps {
    /**
     * The label of the "Now" button.
     */
    currentDateLabel?: string;
    /**
     * Additional actions, shown in a menu at the end of the field next to a clear button named by the
     * picker's `fieldClearLabel` translation. An empty array is the same as omitting `actions`.
     */
    actions?: Action[];
    /**
     * Accessible name of the icon button that opens the `actions` menu. A blank value counts as not provided.
     * @default 'More actions'
     */
    actionsAriaLabel?: string;
}

export function DatePicker(props: DatePickerProps): React.JSX.Element {
    const { className, currentDateLabel, actions, actionsAriaLabel, dataTestIdSuffix, ...otherProps } = props;

    const dataTestId = useRingDataTestId('DatePicker', dataTestIdSuffix);

    const anchorRef = useRef<HTMLButtonElement>(null);

    const actionsComponent = actions?.length ? (
        <ActionsWithClearIconButton
            actions={actions}
            ariaLabel={actionsAriaLabel}
            anchorRef={anchorRef}
            dataTestId={dataTestId}
        />
    ) : undefined;

    const shortcuts: PickersShortcutsItem<Dayjs>[] = [];

    if (currentDateLabel) {
        shortcuts.push({
            label: currentDateLabel ?? '',
            getValue: () => {
                return dayjs();
            },
        });
    }

    const muiDatePickerProps: DatePickerProps = {
        ...otherProps,
        slotProps: {
            ...otherProps?.slotProps,
            field: {
                clearable: true,
                openPickerButtonPosition: 'start',
                ...otherProps?.slotProps?.field,
            },
            // No variant, padding or height is set here; the theme styles MUI X's default `outlined`
            // field. The consumer's `slotProps.textField` may be a callback, so it is resolved before
            // spreading or its props would be silently dropped.
            textField: (ownerState) => {
                const consumerTextField = otherProps?.slotProps?.textField;

                return {
                    'data-testid': dataTestId,
                    InputProps: {
                        endAdornment: actionsComponent,
                    },
                    ...((typeof consumerTextField === 'function'
                        ? consumerTextField(ownerState)
                        : consumerTextField) as Record<string, unknown>),
                };
            },
            shortcuts: {
                ...otherProps?.slotProps?.shortcuts,
                items: shortcuts,
            },
            openPickerButton: {
                size: 'small',
                ...otherProps?.slotProps?.openPickerButton,
            },
            clearButton: {
                size: 'small',
                edge: false,
                ...otherProps?.slotProps?.clearButton,
            },
        },
        sx: [...(Array.isArray(otherProps?.sx) ? otherProps.sx : [otherProps?.sx])],
    };

    return (
        <div
            className={classNames('ring-date-picker', className)}
            style={{ position: 'relative', display: 'inline-flex' }}
        >
            <MuiDatePicker {...muiDatePickerProps} />
        </div>
    );
}
