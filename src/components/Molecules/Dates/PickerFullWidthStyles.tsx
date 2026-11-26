import React from 'react';
import { GlobalStyles } from '@mui/material';

/** Class on the wrapper of a DatePicker, DateTimePicker or TimePicker whose field is full width. */
export const PICKER_FULL_WIDTH_CLASS = 'ring-picker-full-width';

// `:where()` keeps the rule at zero specificity, so a width the consumer gives the wrapper through `className` wins
// whatever order the stylesheets load in.
const FULL_WIDTH_RULES = { [`:where(.${PICKER_FULL_WIDTH_CLASS})`]: { width: '100%' } };

/** Makes a wrapper with `PICKER_FULL_WIDTH_CLASS` as wide as its container, in a flex row too. */
export function PickerFullWidthStyles(): React.JSX.Element {
    return <GlobalStyles styles={FULL_WIDTH_RULES} />;
}
