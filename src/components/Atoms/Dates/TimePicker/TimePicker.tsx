import React from 'react';
import classNames from 'classnames';

import type {} from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MuiTimePicker, TimePickerProps as MuiTimePickerProps } from '@mui/x-date-pickers-pro';
import { CommonComponentProps } from '../../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../../helpers/hooks/useRingDataTestId.js';

/**
 * Props for the TimePicker component.
 */
export interface TimePickerProps extends MuiTimePickerProps, CommonComponentProps {
    /**
     * CSS additional class
     */
    className?: string;
}

export function TimePicker(props: TimePickerProps): React.JSX.Element {
    const { className, dataTestIdSuffix, ...otherProps } = props;

    const dataTestId = useRingDataTestId(TimePicker.name, dataTestIdSuffix);

    const resolvedVariant =
        ((otherProps.slotProps?.textField as Record<string, unknown>)?.variant as string) ?? 'standard';

    const muiTimePickerProps: MuiTimePickerProps = {
        ...otherProps,
        slotProps: {
            field: {
                clearable: true,
                openPickerButtonPosition: 'start',
                ...otherProps.slotProps?.field,
            },
            textField: () => ({
                'data-testid': dataTestId,
                InputProps: {
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
            className={classNames('ring-time-picker', className)}
            style={{ position: 'relative', display: 'inline-flex' }}
        >
            <MuiTimePicker {...muiTimePickerProps} />
        </div>
    );
}
