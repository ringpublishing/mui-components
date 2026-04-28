import React, { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, MenuItem, Select, Typography, SelectChangeEvent } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { WithDataTestIdSuffix } from '../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../helpers/typographyMode.js';

export interface EditableSelectProps extends WithDataTestIdSuffix {
    value: string;
    options: Array<{ value: string; label: string }>;
    onSubmit: (value: string) => Promise<boolean>;
}

export function EditableSelect(props: EditableSelectProps): React.JSX.Element {
    const { value, options, onSubmit, dataTestIdSuffix } = props;
    const [editMode, setEditMode] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [loading, setLoading] = useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);

    const dataTestId = useRingDataTestId(EditableSelect.name, dataTestIdSuffix);

    const handleEdit = (): void => {
        setEditMode(true);
    };

    const handleChange = (event: SelectChangeEvent): void => {
        setCurrentValue(event.target.value);
        handleSubmit(event.target.value);
    };

    const handleSubmit = async (submitValue = currentValue): Promise<void> => {
        if (submitValue === value) {
            setEditMode(false);

            return;
        }

        setLoading(true);

        try {
            const success = await onSubmit(submitValue);

            if (success) {
                setEditMode(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditMode(false);
            }
        },
        [setEditMode],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleEscape, true);

        return (): void => {
            document.removeEventListener('keydown', handleEscape, true);
        };
    }, [editMode, handleEscape]);

    const displayValue = options.find((option) => option.value === value)?.label || value;

    const handleClickOutside = (event: globalThis.MouseEvent): void => {
        const target = event.target as HTMLElement;

        if (target?.localName === 'div' && target?.className.indexOf('MuiBackdrop-root') > -1) {
            setEditMode(false);
        }
    };

    useEffect(() => {
        if (editMode) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editMode, currentValue, selectRef]);

    if (editMode) {
        return (
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Select
                    inputRef={selectRef}
                    fullWidth={true}
                    size="small"
                    value={currentValue}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={loading}
                    defaultOpen={true}
                    sx={{ fontSize: tv('0.875rem') }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
                variant="caption"
                sx={{
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                {displayValue}
            </Typography>
            <IconButton
                size="small"
                onClick={handleEdit}
                data-testid={`${dataTestId}-edit`}
                sx={{
                    ml: 0.5,
                    p: 0.25,
                    color: (theme) => theme.palette.primary.main,
                }}
            >
                <EditOutlined fontSize="small" />
            </IconButton>
        </Box>
    );
}
