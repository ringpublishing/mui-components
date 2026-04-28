import React, { useRef } from 'react';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';

import { CalendarMonth } from '@mui/icons-material';
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
     * Additional actions to be displayed in the component.
     */
    actions?: Action[];
}

export function DatePicker(props: DatePickerProps): React.JSX.Element {
    const { className, currentDateLabel, actions, dataTestIdSuffix, ...otherProps } = props;

    const dataTestId = useRingDataTestId(DatePicker.name, dataTestIdSuffix);

    const anchorRef = useRef<HTMLButtonElement>(null);

    const actionsComponent = actions ? (
        <ActionsWithClearIconButton actions={actions} anchorRef={anchorRef} />
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

    const resolvedVariant =
        ((otherProps?.slotProps?.textField as Record<string, unknown>)?.variant as string) ?? 'standard';

    const muiDatePickerProps: DatePickerProps = {
        ...otherProps,
        slotProps: {
            ...otherProps?.slotProps,
            field: {
                clearable: true,
                openPickerButtonPosition: 'start',
                ...otherProps?.slotProps?.field,
            },
            textField: () => ({
                'data-testid': dataTestId,
                InputProps: {
                    endAdornment: actionsComponent,
                    sx: {
                        paddingBottom: '3px',
                        minHeight: '32px',
                    },
                },
                ...(otherProps?.slotProps?.textField as Record<string, unknown>),
                variant: resolvedVariant as 'standard',
            }),
            shortcuts: {
                ...otherProps?.slotProps?.shortcuts,
                items: shortcuts,
            },
            openPickerButton: {
                size: 'small',
                sx: {
                    marginBottom: '2px',
                },
                ...otherProps?.slotProps?.openPickerButton,
            },
            clearButton: {
                sx: {
                    padding: '4px',
                },
                ...otherProps?.slotProps?.clearButton,
            },
            clearIcon: {
                sx: {
                    fontSize: '2.25rem',
                },
                ...otherProps?.slotProps?.clearIcon,
            },
        },
        slots: {
            ...otherProps?.slots,
            openPickerIcon: CalendarMonth,
        },
        sx: [
            {
                '& .MuiInputBase-root': {
                    paddingBottom: '0px',
                },
            },
            ...(Array.isArray(otherProps?.sx) ? otherProps.sx : [otherProps?.sx]),
        ],
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
