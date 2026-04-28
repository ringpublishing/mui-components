import React, { useState, useImperativeHandle } from 'react';
import { Box, Button } from '@mui/material';
import classNames from 'classnames';
import { SingleRange } from './SingleRange.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface Option {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    label: string;
    order: number;
}

export interface Range {
    order: number;
    from?: number | Option['value'];
    to?: number | Option['value'];
}

export interface Ranges {
    [code: string]: Range;
}

export interface RangeDefinition {
    label: string;
    order?: number;
    rangeBounds?: {
        min?: number;
        max?: number;
    };
    rangeOptions?: Option[];
    required?: boolean;
}

export interface RangeDefinitions {
    [code: string]: RangeDefinition;
}

export interface RangesLabels {
    rangeSelect: string;
    addRangeButton: string;
    removeRangeButton: string;
    fromInput: string;
    toInput: string;
    rangeSelectPlaceholder?: string;
    valueTooLowError?: string;
    valueTooHighError?: string;
    valueRequiredError?: string;
    invalidRangeError?: string;
}

export interface RangesApiRef {
    getRanges: () => Ranges;
    setRanges: (ranges: Ranges) => void;
    resetRanges: () => void;
}
export interface RangesProps extends CommonComponentProps {
    /**
     * The Range Definitions object composed of keys which act as codes for the ranges
     * and attributes which define the range - label, order, rangeBounds and rangeOptions.
     * Ranges can be defined and used as number fields with optional rangeBounds (min and max)
     * or as select fields with rangeOptions (array of objects with value, label and order).
     * Required attribute can be used to mark both from and to fields as required.
     */
    rangeDefinitions: RangeDefinitions;
    /**
     * The function to be called when the ranges are changed and values in ranges are valid (according to rangeBounds and restraint from <= to).
     */
    onChange: (ranges: Ranges) => void;
    /**
     * The labels object with keys for rangeSelect, addRangeButton, removeRangeButton,
     * rangeSelectPlaceholder, fromInput, toInput, valueTooLowError and valueTooHighError.
     */
    labels: RangesLabels;
    /**
     * The maximum number of ranges that can be applied. After limit is met add range button is hidden.
     * @default Infinity
     */
    maxAppliedRanges?: number;
    /**
     * The initial state of the ranges. If not provided, the component will start with an empty range.
     */
    initialState?: Ranges;
    /**
     * The ref to the Ranges component instance. Allows for receiving the current state of the ranges,
     * overriding ranges state and resetting the ranges.
     */
    apiRef?: React.RefObject<RangesApiRef | null>;
}

export function Ranges(props: RangesProps): React.JSX.Element {
    const {
        rangeDefinitions,
        onChange,
        labels,
        maxAppliedRanges = Infinity,
        initialState,
        sx,
        className,
        apiRef,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId(Ranges.name, dataTestIdSuffix);

    const [appliedRanges, setAppliedRanges] = useState<Ranges>(initialState || {});
    const [showEmptyRange, setShowEmptyRange] = useState(!initialState);

    if (Object.keys(initialState || {}).length > maxAppliedRanges) {
        throw new Error('initial state ranges exceed maxAppliedRanges');
    }

    const appliedRangesCount = Object.keys(appliedRanges).length;
    const rangeDefinitionsCount = Object.keys(rangeDefinitions).length;
    const showAddRangeButton = appliedRangesCount < maxAppliedRanges && appliedRangesCount < rangeDefinitionsCount;

    useImperativeHandle(apiRef, () => ({
        getRanges: (): Ranges => appliedRanges,
        setRanges: (ranges: Ranges): void => {
            setAppliedRanges(ranges);
            setShowEmptyRange(Object.keys(ranges).length === 0);
        },
        resetRanges: (): void => {
            setAppliedRanges(initialState || {});
            setShowEmptyRange(!initialState);
        },
    }));

    return (
        <Box
            data-testid={dataTestId}
            sx={{ width: '100%', '& > *:not(:last-child)': { marginBottom: 2 }, ...sx }}
            className={classNames('ring-ranges', className)}
        >
            {Object.keys(appliedRanges)
                .sort((a, b) => (appliedRanges?.[a]?.order || 0) - (appliedRanges?.[b]?.order || 0))
                .map((code) => (
                    <Box key={code}>
                        <SingleRange
                            code={code}
                            dataTestIdSuffix={dataTestIdSuffix}
                            range={appliedRanges[code]}
                            rangeDefinitions={rangeDefinitions}
                            appliedRanges={appliedRanges}
                            onChangeRange={(newCode, range, isError): void => {
                                let newAppliedRanges: Ranges = {};

                                if (newCode !== code) {
                                    const keys = Object.keys(appliedRanges).filter((k) => k !== code);
                                    newAppliedRanges = {
                                        ...keys.reduce((acc, k) => ({ ...acc, [k]: appliedRanges[k] }), {}),
                                        [newCode]: range,
                                    };
                                } else {
                                    newAppliedRanges = { ...appliedRanges, [code]: range };
                                }

                                setAppliedRanges(newAppliedRanges);

                                if (!isError) {
                                    onChange(newAppliedRanges);
                                }
                            }}
                            labels={labels}
                        />
                        <Button
                            size={'small'}
                            color={'primary'}
                            variant={'text'}
                            sx={{ width: '30px', marginTop: 1 }}
                            onClick={(): void => {
                                const newAppliedRanges = { ...appliedRanges };

                                Object.keys(newAppliedRanges).forEach((k) => {
                                    if (newAppliedRanges[k].order > appliedRanges[code].order) {
                                        newAppliedRanges[k] = Object.assign({}, newAppliedRanges[k], {
                                            order: newAppliedRanges[k].order - 1,
                                        });
                                    }
                                });
                                delete newAppliedRanges[code];

                                if (Object.keys(newAppliedRanges).length === 0) {
                                    setShowEmptyRange(true);
                                }

                                setAppliedRanges(newAppliedRanges);
                                onChange(newAppliedRanges);
                            }}
                        >
                            {labels.removeRangeButton}
                        </Button>
                    </Box>
                ))}
            {showEmptyRange && (
                <SingleRange
                    code={''}
                    range={undefined}
                    rangeDefinitions={rangeDefinitions}
                    appliedRanges={appliedRanges}
                    labels={labels}
                    onChangeRange={(code, range, isError): void => {
                        const newAppliedRanges = { ...appliedRanges, [code]: range };
                        setAppliedRanges(newAppliedRanges);
                        setShowEmptyRange(false);

                        if (!isError) {
                            onChange(newAppliedRanges);
                        }
                    }}
                />
            )}
            {showAddRangeButton && !showEmptyRange && (
                <Button
                    size={'small'}
                    variant={'outlined'}
                    color={'primary'}
                    onClick={(): void => setShowEmptyRange(true)}
                    sx={{ width: '100%' }}
                >
                    {labels.addRangeButton}
                </Button>
            )}
        </Box>
    );
}
