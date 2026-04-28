import React, { useRef } from 'react';
import classNames from 'classnames';

import { CalendarMonth } from '@mui/icons-material';
import type {} from '@mui/x-date-pickers/AdapterDayjs';
import {
    DateTimePicker as MuiDateTimePicker,
    DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers-pro';

import { Action } from '../../../../types.js';
import { CommonComponentProps } from '../../../../helpers/commonTypes.js';
import { ActionsWithClearIconButton } from '../ActionsWithClearIconButton.js';
import { useRingDataTestId } from '../../../../helpers/hooks/useRingDataTestId.js';

/**
 * Props for the DateTimePicker component.
 */
export interface DateTimePickerProps extends MuiDateTimePickerProps, CommonComponentProps {
    /**
     * Additional actions to be displayed in the component.
     */
    actions?: Action[];
}

export function DateTimePicker(props: DateTimePickerProps): React.JSX.Element {
    const { className, actions, dataTestIdSuffix, ...otherProps } = props;

    const dataTestId = useRingDataTestId(DateTimePicker.name, dataTestIdSuffix);

    const anchorRef = useRef<HTMLButtonElement>(null);

    const actionsComponent = actions ? (
        <ActionsWithClearIconButton actions={actions} anchorRef={anchorRef} />
    ) : undefined;

    const resolvedVariant =
        ((otherProps.slotProps?.textField as Record<string, unknown>)?.variant as string) ?? 'standard';

    const muiDateTimePickerProps: DateTimePickerProps = {
        ...otherProps,
        slotProps: {
            ...otherProps.slotProps,
            field: {
                clearable: true,
                openPickerButtonPosition: 'start',
                ...otherProps.slotProps?.field,
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
                ...(otherProps.slotProps?.textField as Record<string, unknown>),
                variant: resolvedVariant as 'standard',
            }),
            openPickerButton: {
                size: 'small',
                sx: {
                    marginBottom: '2px',
                },
                ...otherProps.slotProps?.openPickerButton,
            },
            clearButton: {
                sx: {
                    padding: '4px',
                },
                ...otherProps.slotProps?.clearButton,
            },
            clearIcon: {
                sx: {
                    fontSize: '2.25rem',
                },
                ...otherProps.slotProps?.clearIcon,
            },
        },
        slots: {
            ...otherProps.slots,
            openPickerIcon: CalendarMonth,
        },
        sx: [
            {
                '& .MuiInputBase-root': {
                    paddingBottom: '0px',
                },
            },
            {
                // minWidth is set because of overflow issues with the input field
                minWidth: actionsComponent ? 310 : 280,
            },
            ...(Array.isArray(otherProps?.sx) ? otherProps.sx : [otherProps?.sx]),
        ],
    };

    return (
        <div
            className={classNames('ring-date-time-picker', className)}
            style={{ position: 'relative', display: 'inline-flex' }}
        >
            <MuiDateTimePicker {...muiDateTimePickerProps} />
        </div>
    );
}
