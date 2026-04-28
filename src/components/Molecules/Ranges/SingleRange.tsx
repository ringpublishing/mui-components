import React, { useState } from 'react';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Option, Range, RangeDefinitions, Ranges, RangesLabels } from './Ranges.js';
import { Autocomplete } from '../Autocomplete/Autocomplete.js';
import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

interface RangeProps extends WithDataTestIdSuffix {
    range: Range | undefined;
    code: string;
    rangeDefinitions: RangeDefinitions;
    appliedRanges: Ranges;
    onChangeRange: (key: string, range: Range, isError?: boolean) => void;
    labels: RangesLabels;
}

type ValueError = null | 'tooHigh' | 'tooLow' | 'invalidRange' | 'required';

interface RangeDefinitionOption {
    label: string;
    code: string;
}

export function SingleRange(props: RangeProps): React.JSX.Element {
    const { range, code, rangeDefinitions, appliedRanges, onChangeRange, labels, dataTestIdSuffix } = props;

    const dataTestIdPrefixWithCode = dataTestIdSuffix ? `${code}-${dataTestIdSuffix}` : code;
    const dataTestId = useRingDataTestId('ranges-item', dataTestIdPrefixWithCode);

    const maxValue = rangeDefinitions[code]?.rangeBounds?.max;
    const minValue = rangeDefinitions[code]?.rangeBounds?.min;
    const required = rangeDefinitions[code]?.required;

    const [fromError, setFromError] = useState<ValueError>(range?.from === undefined && required ? 'required' : null);
    const [toError, setToError] = useState<ValueError>(range?.to === undefined && required ? 'required' : null);

    const errorLabels = {
        tooHigh: labels?.valueTooHighError && labels.valueTooHighError + (maxValue || ''),
        tooLow: labels?.valueTooLowError && labels.valueTooLowError + (minValue || ''),
        invalidRange: labels.invalidRangeError,
        required: labels.valueRequiredError,
    };

    const rangeOptions: Option[] | null = rangeDefinitions[code]?.rangeOptions || null;

    const handleChangeRange = (range: Range, changed?: 'from' | 'to'): void => {
        let fromError: ValueError = null;
        let toError: ValueError = null;

        if (typeof range.from === 'number' && typeof range.to === 'number') {
            if (range.from > range.to && changed === 'from') {
                fromError = 'invalidRange';
            } else if (range.to < range.from) {
                toError = 'invalidRange';
            }
        }

        if (maxValue !== undefined) {
            if (typeof range.to === 'number' && range.to > maxValue) {
                toError = 'tooHigh';
            }

            if (typeof range.from === 'number' && range.from > maxValue) {
                fromError = 'tooHigh';
            }
        }

        if (minValue !== undefined) {
            if (typeof range.to === 'number' && range.to < minValue) {
                toError = 'tooLow';
            }

            if (typeof range.from === 'number' && range.from < minValue) {
                fromError = 'tooLow';
            }
        }

        if (required && range.from === undefined) {
            fromError = 'required';
        }

        if (required && range.to === undefined) {
            toError = 'required';
        }

        setFromError(fromError);
        setToError(toError);
        onChangeRange(code, range, Boolean(fromError) || Boolean(toError));
    };

    return (
        <Box>
            <Autocomplete
                dataTestIdSuffix={dataTestIdPrefixWithCode}
                options={Object.keys(rangeDefinitions)
                    .sort((a, b) => (rangeDefinitions[a].order ?? 0) - (rangeDefinitions[b].order ?? 0))
                    .map((key) => ({ label: rangeDefinitions[key].label, code: key }))}
                value={code !== '' ? { label: rangeDefinitions[code]?.label || '', code } : null}
                onChange={(event, newValue): void => {
                    if (newValue) {
                        onChangeRange((newValue as RangeDefinitionOption).code, {
                            order: typeof range?.order === 'number' ? range.order : Object.keys(appliedRanges).length,
                        });
                    }
                }}
                disableClearable={true}
                isOptionEqualToValue={(option, value): boolean =>
                    (option as RangeDefinitionOption).code === (value as RangeDefinitionOption).code
                }
                getOptionDisabled={(option): boolean => Boolean(appliedRanges[(option as RangeDefinitionOption).code])}
                title={labels.rangeSelect}
                labels={{
                    title: labels.rangeSelect,
                    inputPlaceholder: labels.rangeSelectPlaceholder,
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginTop: 1,
                    '& .MuiFormControl-root': {
                        width: '100%',
                    },
                }}
            >
                {rangeOptions === null ? (
                    range ? (
                        <>
                            <TextField
                                slotProps={{
                                    htmlInput: { 'data-testid': `${dataTestId}-from` },
                                }}
                                label={labels.fromInput}
                                value={range.from || ''}
                                type="number"
                                error={Boolean(fromError)}
                                helperText={fromError && errorLabels[fromError]}
                                onChange={(event): void => {
                                    const from = Number(event.target.value);

                                    if (event.target.value === '' || from === 0) {
                                        handleChangeRange({ ...range, from: undefined });

                                        return;
                                    }

                                    handleChangeRange({ ...range, from }, 'from');
                                }}
                            />
                            <Typography variant={'h5'} sx={{ margin: '12px 8px 0px 8px' }}>
                                -
                            </Typography>
                            <TextField
                                slotProps={{
                                    htmlInput: { 'data-testid': `${dataTestId}-to` },
                                }}
                                label={labels.toInput}
                                value={range.to || ''}
                                type="number"
                                error={Boolean(toError)}
                                helperText={toError && errorLabels[toError]}
                                onChange={(event): void => {
                                    const to = Number(event.target.value);

                                    if (event.target.value === '' || to === 0) {
                                        handleChangeRange({ ...range, to: undefined });

                                        return;
                                    }

                                    handleChangeRange({ ...range, to }, 'to');
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <TextField label={labels.fromInput} disabled={true} />
                            <Typography variant={'h5'} sx={{ margin: '12px 8px 0px 8px' }}>
                                -
                            </Typography>
                            <TextField label={labels.toInput} disabled={true} />
                        </>
                    )
                ) : (
                    range && (
                        <>
                            <FormControl>
                                <InputLabel>{labels.fromInput}</InputLabel>
                                <Select
                                    data-testid={`${dataTestId}-select-from`}
                                    label={labels.fromInput}
                                    value={range.from || ''}
                                    onChange={(event): void => {
                                        const from = event.target.value;
                                        handleChangeRange({ ...range, from: from === '' ? undefined : from });
                                    }}
                                    error={Boolean(fromError)}
                                >
                                    {!required && (
                                        <MenuItem value="" sx={{ justifyContent: 'center' }}>
                                            -
                                        </MenuItem>
                                    )}
                                    {rangeOptions
                                        .filter(
                                            (option) =>
                                                option.order <=
                                                (rangeOptions.find((option) => option.value === range.to)?.order ||
                                                    Infinity),
                                        )
                                        .map((option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                sx={{ justifyContent: 'center' }}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                </Select>
                                {fromError && <FormHelperText error={true}>{errorLabels[fromError]}</FormHelperText>}
                            </FormControl>
                            <Typography variant={'h5'} sx={{ margin: '12px 8px 0px 8px' }}>
                                -
                            </Typography>
                            <FormControl>
                                <InputLabel>{labels.toInput}</InputLabel>
                                <Select
                                    data-testid={`${dataTestId}-select-to`}
                                    label={labels.toInput}
                                    value={range.to || ''}
                                    onChange={(event): void => {
                                        const to = event.target.value;
                                        handleChangeRange({ ...range, to: to === '' ? undefined : to });
                                    }}
                                    error={Boolean(toError)}
                                >
                                    {!required && (
                                        <MenuItem value="" sx={{ justifyContent: 'center' }}>
                                            -
                                        </MenuItem>
                                    )}
                                    {rangeOptions
                                        .filter(
                                            (option) =>
                                                option.order >=
                                                (rangeOptions.find((option) => option.value === range.from)?.order ||
                                                    -Infinity),
                                        )
                                        .map((option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                                sx={{ justifyContent: 'center' }}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                </Select>
                                {toError && <FormHelperText error={true}>{errorLabels[toError]}</FormHelperText>}
                            </FormControl>
                        </>
                    )
                )}
            </Box>
        </Box>
    );
}
