import React from 'react';
import { Box, Chip } from '@mui/material';
import { Delete, OpenInNew, Star, StarBorder } from '@mui/icons-material';
import { ActionBox, Autocomplete, ActionBoxItem } from '../../../../../src/index.js';

interface Option {
    id: number;
    label: string;
}

const options: Option[] = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

interface OptionChipProps {
    option: Option;
    label: string;
    chipProps: React.ComponentProps<typeof Chip>;
    isMain: boolean;
    onSetMain: () => void;
}

function OptionChip({ option, label, chipProps, isMain, onSetMain }: OptionChipProps): React.JSX.Element {
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const actions: ActionBoxItem[] = [
        {
            label: 'Open portal',
            onClick: (): void => console.info('Details', option),
            icon: <OpenInNew />,
        },
        {
            label: isMain ? 'Unset as main' : 'Set as main',
            onClick: onSetMain,
            icon: isMain ? <StarBorder /> : <Star />,
            hasSeparatorAfter: true,
        },
        {
            label: 'Remove from selection',
            onClick: (event?: React.MouseEvent<Element, MouseEvent>): void =>
                chipProps.onDelete?.(event as React.SyntheticEvent),
            icon: <Delete />,
        },
    ];

    return (
        <>
            <Box
                ref={anchorRef}
                onClick={(): void => undefined}
                sx={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                }}
            >
                <Chip
                    {...chipProps}
                    label={label}
                    color={isMain ? 'primary' : 'default'}
                    onClick={(): void => undefined}
                />
            </Box>
            <ActionBox actions={actions} anchorEl={anchorRef} placement="bottom-start" />
        </>
    );
}

export default function WithChipActionsExample(): React.JSX.Element {
    const [selectedOptions, setSelectedOptions] = React.useState(options);
    const [mainOptionId, setMainOptionId] = React.useState(options[0].id);

    const handleChange = (nextOptions: Option[]): void => {
        setSelectedOptions(nextOptions);

        if (!nextOptions.some((option) => option.id === mainOptionId)) {
            setMainOptionId(nextOptions[0]?.id ?? 0);
        }
    };

    return (
        <Autocomplete<Option>
            options={options}
            value={selectedOptions}
            onChange={(event, nextValue): void => handleChange(nextValue as Option[])}
            multiple={true}
            labels={{ title: 'Select portals' }}
            renderChip={({ option, label, chipProps }): React.JSX.Element => (
                <OptionChip
                    option={option}
                    label={label}
                    chipProps={chipProps}
                    isMain={option.id === mainOptionId}
                    onSetMain={(): void =>
                        setMainOptionId(
                            option.id === mainOptionId
                                ? (selectedOptions.find((selectedOption) => selectedOption.id !== option.id)?.id ?? 0)
                                : option.id,
                        )
                    }
                />
            )}
            sx={{ width: 420 }}
        />
    );
}
