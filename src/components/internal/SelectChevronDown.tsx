import React from 'react';
import { Select, SelectProps, SxProps, Theme } from '@mui/material';
import { ChevronDown } from 'lucide-react';

function SelectChevronDownIcon(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
    // Centre the 20px glyph on the select box, whatever height the box ends up with.
    return <ChevronDown size={20} style={{ top: 'calc(50% - 10px)', right: '2px', ...props.style }} {...props} />;
}

export function SelectChevronDown(props: SelectProps<string>): React.JSX.Element {
    const { inputProps, sx, ...selectProps } = props;
    // The theme sizes every standard input as a 32/40px form field. This is an inline control
    // sitting in a toolbar row, so it keeps the height of its own caption text instead.
    const defaultSx: SxProps<Theme> = {
        '&::before': {
            display: 'none',
        },
        '&::after': {
            display: 'none',
        },
        '& > .MuiSelect-select': {
            padding: 0,
            height: 'auto',
        },
        minHeight: 0,
        lineHeight: '1.4375em',
        fontSize: (theme) => theme.typography.caption.fontSize,
    };

    return (
        <Select
            {...selectProps}
            inputProps={{ 'aria-label': 'Sort by', ...inputProps }}
            sx={sx ? [defaultSx, ...(Array.isArray(sx) ? sx : [sx])] : defaultSx}
            variant="standard"
            size="small"
            IconComponent={SelectChevronDownIcon}
        />
    );
}
