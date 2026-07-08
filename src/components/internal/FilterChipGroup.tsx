import { ChipProps, Divider, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ChipsGroup } from '../Molecules/ChipsGroup/ChipsGroup.js';

export interface FilterChip {
    filter: string;
    /**
     * Value of the filter. When omitted (e.g. boolean filters where only the key is meaningful),
     * the chip renders just the `filter` key without the `:` separator.
     */
    value?: string;
    onDelete: () => void;
}

interface FilterChipGroupProps {
    chips?: FilterChip[];
    onDeleteAll?: () => void;
    customLabels?: {
        deleteAll?: string;
        showLess?: string;
    };
}

export const FilterChipGroup = (props: FilterChipGroupProps): React.JSX.Element | null => {
    const { chips, onDeleteAll } = props;

    // Content signature of the current chip set, used to detect when the filters change.
    // JSON.stringify encodes the array injectively so distinct chip sets never collide.
    const signature = useMemo(
        () => JSON.stringify((chips ?? []).map((chip) => [chip.filter, chip.value ?? null])),
        [chips],
    );

    const chipsGroupChips: ChipProps[] = useMemo(
        () =>
            chips?.map(
                (chip) =>
                    ({
                        label: chip.value ? (
                            <Stack direction="row" alignItems="center" display={'flex'} gap={'4px'}>
                                <Typography color="secondary">{chip.filter}:</Typography>
                                <Typography noWrap={true}>{chip.value}</Typography>
                            </Stack>
                        ) : (
                            <Typography noWrap={true}>{chip.filter}</Typography>
                        ),
                        onDelete: chip.onDelete,
                        variant: 'outlined',
                        size: 'small',
                    }) satisfies ChipProps,
            ) ?? [],
        [chips],
    );

    // "Clear all" is handled by ChipsGroup's own internal state, which diverges from
    // `props.chips` and would otherwise leave the wrapper (Stack + Divider) rendered with
    // residual height. Track a local "dismissed" flag and reset it whenever the chip set
    // changes — the documented "adjust state during render" pattern (no effect needed).
    const [prevSignature, setPrevSignature] = useState(signature);
    const [dismissed, setDismissed] = useState(false);

    if (signature !== prevSignature) {
        setPrevSignature(signature);
        setDismissed(false);
    }

    if (chipsGroupChips.length === 0 || dismissed) {
        return null;
    }

    const handleDeleteAll = (): void => {
        setDismissed(true);
        onDeleteAll?.();
    };

    return (
        <Stack gap={1}>
            <ChipsGroup
                collapsable={true}
                expandable={true}
                chips={chipsGroupChips}
                onDeleteAll={onDeleteAll && chipsGroupChips.length > 1 ? handleDeleteAll : undefined}
                customLabels={props.customLabels}
            />
            <Divider />
        </Stack>
    );
};
