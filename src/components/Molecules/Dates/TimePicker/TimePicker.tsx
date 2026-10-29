import React from 'react';
import classNames from 'classnames';

import type { TextFieldProps } from '@mui/material';
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

    const dataTestId = useRingDataTestId('TimePicker', dataTestIdSuffix);

    const muiTimePickerProps: MuiTimePickerProps = {
        ...otherProps,
        slotProps: {
            ...otherProps.slotProps,
            field: {
                clearable: true,
                openPickerButtonPosition: 'start',
                ...otherProps.slotProps?.field,
            },
            // No variant, padding or height is set here; the theme styles MUI X's default `outlined`
            // field. The consumer's `slotProps.textField` may be a callback, so it is resolved before
            // spreading or its props would be silently dropped.
            textField: (ownerState) => {
                const consumerTextField = otherProps.slotProps?.textField;

                return {
                    'data-testid': dataTestId,
                    ...((typeof consumerTextField === 'function'
                        ? consumerTextField(ownerState)
                        : consumerTextField) as Record<string, unknown>),
                } as Partial<Omit<TextFieldProps, 'onKeyDown'>>;
            },
            openPickerButton: {
                size: 'small',
                ...otherProps.slotProps?.openPickerButton,
            },
            clearButton: {
                size: 'small',
                edge: false,
                ...otherProps.slotProps?.clearButton,
            },
        },
        sx: [...(Array.isArray(otherProps?.sx) ? otherProps.sx : [otherProps?.sx])],
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
