import { ChipProps, Divider, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { ChipsGroup } from '../Molecules/ChipsGroup/ChipsGroup.js';

export interface FilterChip {
    filter: string;
    value: string;
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
    const chipsGroupChips: ChipProps[] = useMemo(
        () =>
            chips?.map(
                (chip) =>
                    ({
                        label: (
                            <Stack direction="row" alignItems="center" display={'flex'} gap={'4px'}>
                                <Typography color="secondary">{chip.filter}:</Typography>
                                <Typography noWrap={true}>{chip.value}</Typography>
                            </Stack>
                        ),
                        onDelete: chip.onDelete,
                        variant: 'outlined',
                        size: 'small',
                    }) satisfies ChipProps,
            ) ?? [],
        [chips],
    );

    if (chipsGroupChips.length === 0) {
        return null;
    }

    return (
        <Stack gap={1}>
            <ChipsGroup
                collapsable={true}
                expandable={true}
                chips={chipsGroupChips}
                onDeleteAll={onDeleteAll}
                customLabels={props.customLabels}
            />
            <Divider />
        </Stack>
    );
};
