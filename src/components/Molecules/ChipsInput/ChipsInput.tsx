import React, { useEffect, useState } from 'react';
import {
    Autocomplete,
    TextField,
    Stack,
    Chip,
    Box,
    Tooltip,
    UseAutocompleteProps,
    AutocompleteChangeReason,
} from '@mui/material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export enum ChipColor {
    DEFAULT = 'default',
    SECONDARY = 'secondary',
    ERROR = 'error',
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
}
export interface ChipsColorsType {
    default: ChipColor;
    error: ChipColor;
}

export interface AutocompleteChip {
    color?: ChipColor;
    id: string | number;
    label: string;
}

export interface ChipsInputLabels {
    /**
     * The title of the autocomplete
     */
    title?: string;
    /**
     * The placeholder of the input
     */
    inputPlaceholder?: string;
    /**
     * The message that item is already on the list
     */
    alreadyOnList: string;
}

export interface ChipsInputProps
    extends
        CommonComponentProps,
        Omit<
            UseAutocompleteProps<AutocompleteChip, true, false, true>,
            'renderInput' | 'freeSolo' | 'multiple' | 'renderTags' | 'options' | 'onChange' | 'value'
        > {
    /**
     * Function to validate chips value
     */
    validationFunction?(value: AutocompleteChip): boolean;
    /**
     * The callback for adding / removing chip
     */
    onChange: (value: AutocompleteChip[]) => void;
    /**
     * The labels of the autocomplete
     * `{ title: string, inputPlaceholder?: string, alreadyOnList: string }`
     */
    labels: ChipsInputLabels;
    /**
     * Chip colors, error state is used only when validationFunction is provided
     * @default { default: ChipColor.default, error: ChipColor.error }
     */
    chipsColors?: ChipsColorsType;
    /**
     * The value of the input
     */
    value?: AutocompleteChip[];
}

export function ChipsInput(props: ChipsInputProps): React.JSX.Element {
    const {
        onChange,
        validationFunction,
        labels,
        chipsColors = {
            default: ChipColor.DEFAULT,
            error: ChipColor.ERROR,
        },
        dataTestIdSuffix,
        ...otherProps
    } = props;

    const dataTestId = useRingDataTestId(ChipsInput.name, dataTestIdSuffix);

    const [chips, setChips] = useState<AutocompleteChip[]>([]);

    const setChipColor = (value: AutocompleteChip): ChipColor => {
        if (!validationFunction) {
            return chipsColors.default;
        }

        return validationFunction?.(value) ? chipsColors.default : chipsColors.error;
    };

    useEffect(() => {
        if (props?.value) {
            setChips(props.value);
        }
    }, [props.value]);

    const deleteChip = (chipToDelete: string | number): void => {
        const newChips: AutocompleteChip[] = chips.filter((chip) => chip.id !== chipToDelete);
        setChips(newChips);
        onChange(newChips);
    };

    const addNewChips = (item: HTMLInputElement): void => {
        if (chips.some((chip) => chip.label === item.value)) {
            setShowAlreadyOnList(true);
            setTimeout(() => {
                setShowAlreadyOnList(false);
            }, 1000);

            return;
        }

        const newChips: AutocompleteChip[] = [
            ...chips,
            {
                label: item.value,
                id: item.value,
                ...(validationFunction?.({
                    label: item.value,
                    id: item.value,
                })
                    ? {}
                    : { color: ChipColor.ERROR }),
            },
        ];
        setChips(newChips);
        onChange(newChips);
    };

    const handleKeyDown = (event: React.SyntheticEvent, reason: AutocompleteChangeReason): void => {
        if (reason === 'clear') {
            setChips([]);
            onChange([]);
        }

        if (event.nativeEvent instanceof KeyboardEvent && event.nativeEvent.key === 'Enter') {
            addNewChips(event.target as HTMLInputElement);
        }
    };

    const [showAlreadyOnList, setShowAlreadyOnList] = useState(false);

    return (
        <Tooltip open={showAlreadyOnList} title={labels.alreadyOnList} placement="top">
            <Autocomplete
                {...otherProps}
                data-testid={dataTestId}
                sx={{
                    paddingTop: 1,
                    ...otherProps.sx,
                }}
                multiple={true}
                freeSolo={true}
                options={[]}
                value={chips}
                onChange={(event: React.SyntheticEvent, value, reason): void => {
                    handleKeyDown(event, reason);
                }}
                renderTags={(values: AutocompleteChip[]): React.ReactNode => {
                    return (
                        <Stack spacing={'4px'} direction={'row'} useFlexGap={true} flexWrap="wrap" paddingRight={'4px'}>
                            {values.map((value: AutocompleteChip, index: number) => {
                                return (
                                    <Box sx={{ maxWidth: '150px' }} key={`box_${value.label}_${index}`}>
                                        <Tooltip title={value.label}>
                                            <Chip
                                                data-testid={`${dataTestId}-chip-${index}`}
                                                onDelete={(): void => deleteChip(value.id)}
                                                size={'small'}
                                                key={`${value.label}_${index}`}
                                                label={value.label}
                                                color={setChipColor(value)}
                                            />
                                        </Tooltip>
                                    </Box>
                                );
                            })}
                        </Stack>
                    );
                }}
                renderInput={(params): React.ReactNode => (
                    <TextField
                        label={labels?.title}
                        placeholder={chips.length === 0 ? labels?.inputPlaceholder : ''}
                        {...params}
                        inputProps={{
                            ...params.inputProps,
                            'data-testid': `${dataTestId}-input`,
                            onChange: (event: React.ChangeEvent<HTMLInputElement>): void => {
                                if (
                                    event.nativeEvent instanceof InputEvent &&
                                    event?.nativeEvent?.inputType === 'insertFromPaste'
                                ) {
                                    event.preventDefault();
                                    addNewChips(event.currentTarget);
                                } else if (event.type === 'change') {
                                    params?.inputProps?.onChange?.(event);
                                }
                            },
                        }}
                    />
                )}
            />
        </Tooltip>
    );
}
